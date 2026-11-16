import mongoose, { Schema } from 'mongoose';
import AppQueryFind from '../app-query-find';

type TDoc = { title: string; status: string; event: string; author: string };

const Model = mongoose.model<TDoc & mongoose.Document>(
  'QueryFindSpec',
  new Schema({ title: String, status: String, event: String, author: String }),
);

describe('AppQueryFind', () => {
  it('ignores non-whitelisted params and applies enforced filters last', () => {
    const q = new AppQueryFind(
      Model,
      { status: 'draft', is_deleted: 'true', event: 'e1', role: 'user' },
      { status: 'published' },
    ).filter(['event']);

    expect(q.query.getFilter()).toEqual({ event: 'e1', status: 'published' });
  });

  it('an empty whitelist allows no filters', () => {
    const q = new AppQueryFind(
      Model,
      { author: 'x' },
      { status: 'published' },
    ).filter([]);
    expect(q.query.getFilter()).toEqual({ status: 'published' });
  });

  it('keeps search, user and enforced $or clauses together', () => {
    const q = new AppQueryFind(
      Model,
      { search: 'abc' },
      { $or: [{ status: 'a' }, { status: 'b' }] },
    )
      .search(['title'])
      .filter([]);

    expect(q.query.getFilter()).toEqual({
      $and: [
        { $or: [{ title: { $regex: 'abc', $options: 'i' } }] },
        { $or: [{ status: 'a' }, { status: 'b' }] },
      ],
    });
  });

  it('paginates by default (20) and caps the limit at 100', () => {
    const byDefault = new AppQueryFind(Model, {}).paginate();
    expect(byDefault.query.getOptions()).toMatchObject({ limit: 20, skip: 0 });

    const capped = new AppQueryFind(Model, {
      page: '3',
      limit: '5000',
    }).paginate();
    expect(capped.query.getOptions()).toMatchObject({ limit: 100, skip: 200 });

    const pageZero = new AppQueryFind(Model, {
      page: '0',
      limit: '10',
    }).paginate();
    expect(pageZero.query.getOptions()).toMatchObject({ limit: 10, skip: 0 });
  });

  it('sorts by -created_at by default and drops non-whitelisted sort fields', () => {
    expect(new AppQueryFind(Model, {}).sort().query.getOptions().sort).toEqual({
      created_at: -1,
    });
    const q = new AppQueryFind(Model, { sort: '-password,title' }).sort([
      'title',
    ]);
    expect(q.query.getOptions().sort).toEqual({ title: 1 });
  });
});
