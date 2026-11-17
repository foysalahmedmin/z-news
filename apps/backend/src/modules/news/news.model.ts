import mongoose, { Query, Schema } from 'mongoose';
import { invalidateNamespaces } from '../../utils/cache.utils';
import { sanitizeHtmlPaths } from '../../utils/sanitize-html';
import { TNews, TNewsDocument, TNewsModel } from './news.type';

const newsSchema = new Schema<TNewsDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    sub_title: {
      type: String,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    content: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },

    youtube: {
      type: String,
    },

    tags: {
      type: [String],
      default: [],
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    categories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    writer: {
      type: String,
    },

    collaborators: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'scheduled', 'published', 'archived'],
      default: 'draft',
    },

    is_featured: {
      type: Boolean,
      default: false,
    },

    published_at: {
      type: Date,
      required: function () {
        return this.status === 'published';
      },
      default: function (this: TNewsDocument) {
        return this.status === 'published' ? new Date() : undefined;
      },
      validate: {
        validator: function (value: Date) {
          if (this.expired_at && value) {
            return value <= this.expired_at;
          }
          return true;
        },
        message: 'published_at cannot be after expired_at',
      },
    },

    // Optional editor-set expiry; the scheduler archives the article once it passes.
    // No default: articles must not silently expire.
    expired_at: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          if (this.published_at && value) {
            return value >= this.published_at;
          }
          return true;
        },
        message: 'expired_at cannot be before published_at',
      },
    },

    is_edited: {
      type: Boolean,
      default: false,
    },

    edited_at: {
      type: Date,
    },

    editor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    layout: {
      type: String,
      default: 'default',
    },

    // SEO Enhancement
    meta_title: { type: String },
    meta_description: { type: String },
    canonical_url: { type: String },
    structured_data: { type: Schema.Types.Mixed },

    // Content Classification
    content_type: {
      type: String,
      enum: ['article', 'video', 'podcast', 'live-blog', 'photo-essay'],
      default: 'article',
    },
    reading_time: { type: Number, default: 0 },
    word_count: { type: Number, default: 0 },

    // Editorial Metadata
    sensitivity_level: {
      type: String,
      enum: ['public', 'sensitive', 'restricted'],
      default: 'public',
    },
    fact_checked: { type: Boolean, default: false },
    fact_checker: { type: Schema.Types.ObjectId, ref: 'User' },
    sources: [
      {
        name: { type: String },
        url: { type: String },
        credibility: { type: Number, min: 0, max: 100 },
      },
    ],

    // Engagement Optimization
    push_notification_sent: { type: Boolean, default: false },
    newsletter_included: { type: Boolean, default: false },
    social_media_posts: [
      {
        platform: { type: String },
        post_id: { type: String },
        posted_at: { type: Date },
      },
    ],

    // Geographic Targeting
    geo_targeting: {
      countries: [String],
      regions: [String],
      cities: [String],
    },

    // Multimedia
    gallery: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    audio: { type: Schema.Types.ObjectId, ref: 'File' },
    podcast_episode: { type: Schema.Types.ObjectId },
    infographics: [{ type: Schema.Types.ObjectId, ref: 'File' }],

    // Related Content
    related_articles: [{ type: Schema.Types.ObjectId, ref: 'News' }],
    series: { type: Schema.Types.ObjectId },

    // Performance Metrics
    avg_time_on_page: { type: Number, default: 0 },
    bounce_rate: { type: Number, default: 0 },
    scroll_depth: { type: Number, default: 0 },
    share_count: { type: Number, default: 0 },

    // Engagement Counters
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

newsSchema.index({ title: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ categories: 1 });
newsSchema.index({ event: 1 });
newsSchema.index({ is_featured: 1 });

newsSchema.index({ created_at: -1 });
newsSchema.index({ published_at: -1 });

newsSchema.index({ title: 1, description: 1 });
newsSchema.index({ title: 'text', description: 'text', tags: 'text' });

newsSchema.virtual('news_headline', {
  ref: 'NewsHeadline',
  localField: '_id',
  foreignField: 'news',
  justOne: true,
});

newsSchema.virtual('news_break', {
  ref: 'NewsBreak',
  localField: '_id',
  foreignField: 'news',
  justOne: true,
});

// toJSON override to remove sensitive fields from output
newsSchema.methods.toJSON = function () {
  const News = this.toObject();
  delete News.is_deleted;
  return News;
};

// Article HTML is rendered raw by the frontend: sanitize it on every write path.
sanitizeHtmlPaths(newsSchema, ['content']);

// Pre-save middleware to calculate word count and reading time
newsSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).length;
    this.word_count = words;
    // Average reading speed: 200 words per minute
    this.reading_time = Math.ceil(words / 200);
  }
  next();
});

// Query middleware to exclude deleted categories
newsSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TNews, TNews>;
  const opts = query.getOptions();

  if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
    query.setQuery({
      ...query.getQuery(),
      is_deleted: { $ne: true },
    });
  }

  next();
});

// newsSchema.pre(/^update/, function (this: Query<TNews, TNews>, next) {
//   this.setQuery({
//     ...this.getQuery(),
//     is_deleted: { $ne: true },
//   });
//   next();
// });

// Aggregation pipeline
newsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Any news write invalidates the news cache, plus headline/break caches that embed news
// title/slug, and revalidates the frontend. Hooks cover every service, job and workflow.
const invalidateNewsCaches = () =>
  invalidateNamespaces('news', 'news-headline', 'news-break');

newsSchema.post('save', invalidateNewsCaches);
newsSchema.post('insertMany', invalidateNewsCaches);
newsSchema.post(
  ['findOneAndUpdate', 'findOneAndDelete'],
  async (doc: unknown) => {
    if (doc) await invalidateNewsCaches();
  },
);
// Skip no-op writes (the scheduler runs updateMany every minute).
newsSchema.post(
  ['updateOne', 'updateMany', 'deleteOne', 'deleteMany'],
  async (result: { modifiedCount?: number; deletedCount?: number }) => {
    if (result?.modifiedCount || result?.deletedCount) {
      await invalidateNewsCaches();
    }
  },
);

// Static methods
newsSchema.statics.isNewsExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
newsSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const News = mongoose.model<TNewsDocument, TNewsModel>(
  'News',
  newsSchema,
);
