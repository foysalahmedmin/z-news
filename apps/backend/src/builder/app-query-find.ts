/* eslint-disable no-console */
import { Document, FilterQuery, Model, PopulateOptions, Query } from 'mongoose';

interface QueryParams {
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
  is_count_only?: string | boolean;
  [key: string]: unknown;
}

type DocumentType<T> = T & Document;

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

class AppQueryFind<T> {
  private model: Model<DocumentType<T>>;
  public query: Query<DocumentType<T>[], DocumentType<T>>;
  public query_params: QueryParams;
  public query_filter: FilterQuery<DocumentType<T>>;

  private page = 1;
  private limit = DEFAULT_PAGE_LIMIT;

  // Server-side conditions (owner, status, ...) that query params can never override.
  private enforced_filter: Record<string, unknown>;
  private user_filter: Record<string, unknown> = {};
  private search_filter?: Record<string, unknown>;

  constructor(
    model: Model<DocumentType<T>>,
    query_params: Record<string, unknown>,
    enforced_filter: Record<string, unknown> = {},
  ) {
    this.model = model;
    this.query = model.find();
    this.query_params = query_params;
    this.enforced_filter = enforced_filter;
    this.query_filter = {};
    this.applyFilter();
  }

  // Rebuilds the Mongo filter: user filters first, enforced ones last. All $or/$and clauses
  // go into one top-level $and so search, user and enforced clauses can't replace each other.
  private applyFilter(): void {
    const { $or: userOr, $and: userAnd, ...userPlain } = this.user_filter;
    const {
      $or: enforcedOr,
      $and: enforcedAnd,
      ...enforcedPlain
    } = this.enforced_filter;

    const and = [
      ...(this.search_filter ? [this.search_filter] : []),
      ...(userOr ? [{ $or: userOr }] : []),
      ...((userAnd as unknown[]) ?? []),
      ...(enforcedOr ? [{ $or: enforcedOr }] : []),
      ...((enforcedAnd as unknown[]) ?? []),
    ];

    this.query_filter = {
      ...userPlain,
      ...enforcedPlain,
      ...(and.length ? { $and: and } : {}),
    } as FilterQuery<DocumentType<T>>;
    this.query.setQuery(this.query_filter);
  }

  search(applicableFields: (keyof T)[]): this {
    const searchValue = this.query_params.search;
    if (searchValue) {
      this.search_filter = {
        $or: applicableFields.map((field) => ({
          [field]: { $regex: searchValue, $options: 'i' },
        })),
      };
      this.applyFilter();
    }
    return this;
  }

  /**
   * Turns query params into Mongo filters. Pass `applicableFields` to allow only those
   * params (an empty array allows none); public endpoints must always pass a list.
   */
  filter(applicableFields?: (keyof T)[]): this {
    const queryObj = { ...this.query_params };
    const excludedFields = [
      'search',
      'sort',
      'limit',
      'page',
      'fields',
      'is_count_only',
    ];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Normal filter
    if (applicableFields) {
      Object.keys(queryObj).forEach((key) => {
        if (!applicableFields.includes(key as keyof T)) {
          delete queryObj[key];
        }
      });
    }

    const mongoFilter: Record<string, unknown> = {};

    // Handle OR
    if (queryObj.or) {
      try {
        mongoFilter.$or = Object.values(
          queryObj.or as Record<string, unknown>,
        ).map((cond: unknown) => cond);
      } catch (_e) {
        console.error('Invalid OR format:', _e);
      }
      delete queryObj.or;
    }

    // Handle AND
    if (queryObj.and) {
      try {
        mongoFilter.$and = Object.values(
          queryObj.and as Record<string, unknown>,
        ).map((cond: unknown) => cond);
      } catch (_e) {
        console.error('Invalid AND format:', _e);
      }
      delete queryObj.and;
    }

    // Merge remaining normal filters
    Object.assign(mongoFilter, queryObj);

    this.user_filter = mongoFilter;
    this.applyFilter();

    return this;
  }

  sort(applicableFields?: string[]): this {
    const rawSort = this.query_params.sort ?? '';
    let fields = rawSort.split(',').filter(Boolean);

    if (applicableFields?.length) {
      fields = fields.filter((field) => {
        const fieldName = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(fieldName);
      });
    }

    const sortOrder = fields.length > 0 ? fields.join(' ') : '-created_at';
    this.query = this.query.sort(sortOrder);
    return this;
  }

  paginate(): this {
    const { page, limit } = this.query_params;

    // Always paginate: default 20, hard max 100 (page=0 is treated as page 1).
    this.page = Math.max(1, Math.floor(Number(page)) || 1);
    this.limit = Math.min(
      MAX_PAGE_LIMIT,
      Math.max(1, Math.floor(Number(limit)) || DEFAULT_PAGE_LIMIT),
    );
    const skip = (this.page - 1) * this.limit;
    this.query = this.query.skip(skip).limit(this.limit);

    return this;
  }

  fields(applicableFields?: (keyof T)[]): this {
    const rawFields = this.query_params.fields ?? '';
    let selectedFields = rawFields.split(',').filter(Boolean);

    if (applicableFields?.length) {
      selectedFields = selectedFields.filter((field) => {
        const fieldName = field.startsWith('-') ? field.slice(1) : field;
        return applicableFields.includes(fieldName as keyof T);
      });
    }

    const fieldSelection =
      selectedFields.length > 0
        ? selectedFields.join(' ')
        : (applicableFields?.join(' ') ?? '-__v');

    this.query = this.query.select(fieldSelection);
    return this;
  }

  populate(
    populateConfig: string | PopulateOptions | Array<string | PopulateOptions>,
  ): this {
    // Mongoose populate accepts string, PopulateOptions, or array of both
    this.query = this.query.populate(populateConfig as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    return this;
  }

  tap(
    callback: (
      query: Query<DocumentType<T>[], DocumentType<T>>,
    ) => Query<unknown, DocumentType<T>>,
  ): this {
    this.query = callback(this.query) as Query<
      DocumentType<T>[],
      DocumentType<T>
    >;
    return this;
  }

  async execute(
    statisticsQueries?: { key: string; filter: Record<string, unknown> }[],
  ): Promise<{
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      statistics?: Record<string, number>;
    };
  }> {
    const [total, stats] = await Promise.all([
      this.model.countDocuments({
        ...this.query_filter,
        ...(!this.query_filter?.is_deleted && {
          is_deleted: { $ne: true },
        }),
      }),
      statisticsQueries
        ? Promise.all(
            statisticsQueries.map(async (stat) => {
              const count = await this.model.countDocuments({
                ...this.query_filter,
                ...stat.filter,
                ...(!this.query_filter?.is_deleted && {
                  is_deleted: { $ne: true },
                }),
              });
              return { key: stat.key, count };
            }),
          )
        : Promise.resolve([]),
    ]);

    const statistics =
      stats?.reduce(
        (acc, curr) => {
          acc[curr.key] = curr.count;
          return acc;
        },
        {} as Record<string, number>,
      ) || undefined;

    const total_pages = Math.ceil(total / this.limit);

    if (this.query_params.is_count_only) {
      return {
        data: [],
        meta: {
          total,
          page: this.page,
          limit: this.limit,
          total_pages,
          statistics,
        },
      };
    }

    const data = (await this.query) as unknown as T[];

    return {
      data,
      meta: {
        total,
        page: this.page,
        limit: this.limit,
        total_pages,
        statistics,
      },
    };
  }
}

export default AppQueryFind;
