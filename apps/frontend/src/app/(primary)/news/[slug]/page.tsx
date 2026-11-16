import NewsCommentSection from "@/components/(common)/news-page/NewsCommentSection";
import NewsDetailsSection from "@/components/(common)/news-page/NewsDetailsSection";
import RelatedNewsSection from "@/components/(common)/news-page/RelatedNewsSection";
import { PROJECT, SEO, URLS } from "@/config";
import { fetchNews } from "@/services/news.service";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// No articles at build time; each is rendered on first visit, then served
// from the ISR cache (5 min + on-demand revalidation by tag).
export const generateStaticParams = async () => [];

// Generate metadata for SEO
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { data } = await fetchNews(decodedSlug);

  if (!data) {
    return { title: "News Not Found" };
  }

  const seoTitle = data?.meta_title || data?.title;
  const seoDescription =
    data?.meta_description ||
    data?.description ||
    data?.content.replace(/<[^>]*>/g, "").substring(0, 160);

  const { thumbnails } = data?.youtube
    ? parseYouTubeUrl(data?.youtube || "")
    : {};

  const thumbnail =
    data?.thumbnail?.url || thumbnails?.default || "/thumbnail.png";

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: data?.tags,
    alternates: {
      canonical: data?.canonical_url || `${URLS.app}/news/${data?.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: thumbnail,
      type: "article",
      url: `${URLS.app}/news/${data?.slug}`,
      publishedTime:
        data?.published_at && new Date(data?.published_at).toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [thumbnail],
    },
  };
};

const NewsPage = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchNews(decodedSlug);
  if (!data) notFound();

  const { thumbnails } = data?.youtube
    ? parseYouTubeUrl(data?.youtube || "")
    : {};

  const thumbnail =
    data?.thumbnail?.url || thumbnails?.default || "/thumbnail.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: data?.title,
    description: data?.description,
    image: thumbnail,
    datePublished:
      data?.published_at && new Date(data?.published_at).toISOString(),
    dateModified:
      (data?.edited_at && new Date(data?.edited_at).toISOString()) ||
      (data?.published_at && new Date(data?.published_at).toISOString()),
    ...(data.author?.name && {
      author: { "@type": "Person", name: data.author.name },
    }),
    publisher: {
      "@type": "Organization",
      name: PROJECT.name,
      logo: { "@type": "ImageObject", url: `${URLS.app}${SEO.image}` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${URLS.app}/news/${data?.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // Escape "<" so a "</script>" inside any field can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
        <div className="space-y-6 py-6">
          {/* News Section - Server Component */}
          <NewsDetailsSection news={data} />

          <div className="container mx-auto">
            <hr />
          </div>

          {/* Comment Section - Client Component */}
          <NewsCommentSection news={data} />

          {/* Related News - Client Component */}
          <RelatedNewsSection news={data} />
        </div>
      </main>
    </>
  );
};

export default NewsPage;
