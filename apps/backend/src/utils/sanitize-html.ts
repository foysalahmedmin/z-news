import { Schema } from 'mongoose';
import sanitizeHtml from 'sanitize-html';

const textStyles = {
  'text-align': [/^(left|right|center|justify)$/],
  color: [/^[#\w(),.%\s-]+$/],
  'background-color': [/^[#\w(),.%\s-]+$/],
};
const length = [/^[\d.]+(px|%|rem|em)?$/];

// Allow-list for what the BlockNote editor exports (blocksToHTMLLossy + the custom
// YouTube/video blocks in apps/frontend/src/components/ui/RichTextEditor.tsx).
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: (
    'p h1 h2 h3 h4 h5 h6 strong b em i u s del code pre blockquote ul ol li a ' +
    'img figure figcaption table thead tbody tfoot tr th td colgroup col br hr ' +
    'span div video audio source iframe'
  ).split(' '),
  allowedAttributes: {
    '*': ['style', 'data-*'],
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    video: ['src', 'controls', 'width', 'height', 'poster'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'title'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    col: ['span'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
    video: ['http', 'https'],
    audio: ['http', 'https'],
    source: ['http', 'https'],
  },
  // Only YouTube embeds (the editor's youtubeEmbed block).
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  allowIframeRelativeUrls: false,
  allowedStyles: {
    '*': textStyles,
    // Responsive 16:9 wrapper + iframe the YouTube block emits.
    div: {
      ...textStyles,
      position: [/^relative$/],
      'padding-bottom': length,
      height: length,
      overflow: [/^hidden$/],
      'max-width': length,
      margin: [/^[\d.\s]+(px|rem|em)?(\s+[\d.]+(px|rem|em)?)*$/],
    },
    iframe: {
      position: [/^absolute$/],
      top: length,
      left: length,
      width: length,
      height: length,
      border: [/^0$/],
    },
    video: { 'max-width': length, height: [/^auto$/, ...length] },
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

export const sanitizeArticleHtml = (html: string): string =>
  sanitizeHtml(html, OPTIONS);

const clean = (value: unknown) =>
  typeof value === 'string' ? sanitizeArticleHtml(value) : value;

/**
 * Sanitizes the given HTML string paths on every Mongoose write path of a schema
 * (save/create, insertMany and query updates), so no service can store raw HTML.
 */
export const sanitizeHtmlPaths = (schema: Schema, paths: string[]): void => {
  schema.pre('save', function (next) {
    for (const path of paths) {
      if (this.isModified(path)) this.set(path, clean(this.get(path)));
    }
    next();
  });

  schema.pre('insertMany', function (next, docs: Record<string, unknown>[]) {
    for (const doc of Array.isArray(docs) ? docs : [docs]) {
      for (const path of paths) {
        if (path in doc) doc[path] = clean(doc[path]);
      }
    }
    next();
  });

  schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
    const update = this.getUpdate() as Record<string, unknown> | null;
    if (update) {
      const $set = update.$set as Record<string, unknown> | undefined;
      for (const path of paths) {
        if (path in update) update[path] = clean(update[path]);
        if ($set && path in $set) $set[path] = clean($set[path]);
      }
    }
    next();
  });
};
