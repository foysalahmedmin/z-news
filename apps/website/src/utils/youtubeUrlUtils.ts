// youtubeUrlUtils.ts

export type YouTubeParseResult = {
  id: string; // video id
  iframe: string; // ready-to-use <iframe> HTML
  url: string; // https://www.youtube.com/embed/{id}...
  thumbnails: {
    default: string; // 120x90
    mq: string; // 320x180
    hq: string; // 480x360
    sd: string; // 640x480
    hd: string; // 1280x720 (may 404 for some videos)
    max: string; // 1920x1080 (may 404 for some videos)
  };
};

type Options = {
  autoplay?: boolean; // default false
  controls?: 0 | 1; // default 1
  fullscreen?: boolean; // default true
  width?: number | string; // default 560
  height?: number | string; // default 315
  title?: string; // default "YouTube video"
  start?: number; // overrides t/start from URL if provided
  rel?: 0 | 1; // default 0 (don’t show related from other channels)
};

/**
 * Main util: pass any YouTube URL, get { id, iframe, embedUrl, thumbnails }
 */
export function parseYouTubeUrl(
  inputUrl: string,
  opts: Options = {},
): YouTubeParseResult {
  const url = inputUrl.trim();
  const id = extractYouTubeId(url);
  
  if (!id) {
    return {
      id: "",
      iframe: "",
      url: "",
      thumbnails: {
        default: ``,
        mq: ``,
        hq: ``,
        sd: ``,
        hd: ``,
        max: ``,
      },
    };
  }

  // figure out start time
  const urlObj = safeURL(url);
  const startFromUrl = urlObj ? parseStartParam(urlObj) : 0;
  const start = Number.isFinite(opts.start)
    ? (opts.start as number)
    : startFromUrl;

  const params = new URLSearchParams();
  params.set("rel", String(opts.rel ?? 0));
  params.set("controls", String(opts.controls ?? 1));
  if (opts.autoplay) params.set("autoplay", "1");
  if (start && start > 0) params.set("start", String(Math.floor(start)));

  const embedUrl = `https://www.youtube.com/embed/${id}${params.toString() ? `?${params}` : ""}`;

  const width = String(opts.width ?? 560);
  const height = String(opts.height ?? 315);
  const allowFs = opts.fullscreen ?? true;
  const title = escapeHtml(opts.title ?? "YouTube video");

  const iframe =
    `<iframe src="${embedUrl}" width="${width}" height="${height}" ` +
    `frameborder="0" title="${title}" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"` +
    (allowFs ? ` allowfullscreen` : ``) +
    `></iframe>`;

  return {
    id,
    iframe,
    url: embedUrl,
    thumbnails: buildThumbnails(id),
  };
}

/* ----------------- helpers ----------------- */

function extractYouTubeId(raw: string): string | null {
  // direct id (11 chars)
  const directId = raw.match(/^[A-Za-z0-9_-]{11}$/);
  if (directId) return directId[0];

  const u = safeURL(raw);
  if (!u) return null;

  // youtu.be/<id>
  const short = u.hostname === "youtu.be" ? u.pathname.slice(1) : null;
  if (short && isVideoId(short)) return short.slice(0, 11);

  // youtube domains
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const isYouTube =
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "gaming.youtube.com" ||
    host === "youtu.be";

  if (!isYouTube) return null;

  // watch?v=<id>
  const vParam = u.searchParams.get("v");
  if (vParam && isVideoId(vParam)) return vParam.slice(0, 11);

  // shorts/<id>
  const shortsMatch = u.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // embed/<id>
  const embedMatch = u.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // share links sometimes put id at first path segment
  const pathId = u.pathname.split("/").filter(Boolean)[0];
  if (pathId && isVideoId(pathId)) return pathId.slice(0, 11);

  return null;
}

function isVideoId(s: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(s);
}

function safeURL(s: string): URL | null {
  try {
    // Add protocol if missing
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) s = `https://${s}`;
    return new URL(s);
  } catch {
    return null;
  }
}

// supports ?t=1m30s or ?t=90 or ?start=90
function parseStartParam(u: URL): number {
  const t = u.searchParams.get("t");
  const start = u.searchParams.get("start");
  if (start && /^\d+$/.test(start)) return parseInt(start, 10);
  if (!t) return 0;

  // formats: "90", "1m30s", "2h3m5s"
  if (/^\d+$/.test(t)) return parseInt(t, 10);

  const h = /(\d+)h/.exec(t)?.[1];
  const m = /(\d+)m/.exec(t)?.[1];
  const s = /(\d+)s/.exec(t)?.[1];
  const hours = h ? parseInt(h, 10) : 0;
  const mins = m ? parseInt(m, 10) : 0;
  const secs = s ? parseInt(s, 10) : 0;
  return hours * 3600 + mins * 60 + secs;
}

function buildThumbnails(id: string) {
  const base = `https://i.ytimg.com/vi/${id}`;
  return {
    default: `${base}/hqdefault.jpg`,
    mq: `${base}/mqdefault.jpg`,
    hq: `${base}/hqdefault.jpg`,
    sd: `${base}/sddefault.jpg`,
    hd: `${base}/hq720.jpg`, // reliable HD
    max: `${base}/maxresdefault.jpg`, // might not exist for all videos
  };
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ] as string,
  );
}
