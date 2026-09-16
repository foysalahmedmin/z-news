import NewsActionSection from "@/components/(common)/news-page/NewsActionSection";
import NewsCommentSection from "@/components/(common)/news-page/NewsCommentSection";
import NewsDetailsSection from "@/components/(common)/news-page/NewsDetailsSection";
import RelatedNewsSection from "@/components/(common)/news-page/RelatedNewsSection";
import { URLS } from "@/config";
import { fetchNews } from "@/services/news.service";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// Generate metadata for SEO
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  try {
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
  } catch (error) {
    return { title: "News Not Found" };
  }
};

const NewsPage = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let { data } = await fetchNews(decodedSlug);

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
    author: {
      "@type": "Person",
      name: data?.author.name,
      email: data?.author.email,
    },
    publisher: {
      "@type": "Organization",
      name: "Your News Site",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
        <div className="space-y-6 py-6">
          {/* News Section - Server Component */}
          <NewsDetailsSection news={data} />

          <div className="container mx-auto">
            <hr />
          </div>

          {/* Like, Dislike & Actions - Client Component */}
          <div className="hidden">
            <NewsActionSection news={data} />
          </div>

          {/* Comment Section - Client Component */}
          <NewsCommentSection news={data} />

          {/* Related News - Server Component */}
          <div className="hidden xl:block">
            <RelatedNewsSection news={data} initialPage={2} />
          </div>

          <div className="xl:hidden">
            <RelatedNewsSection news={data} initialPage={1} />
          </div>
        </div>
      </main>
    </>
  );
};

export default NewsPage;
