import { ENV } from "../env";

export const URLS = {
  app: ENV.app_url,
  api: ENV.api_url,
  user: `${ENV.api_url}/uploads/users`,
  news: {
    thumbnail: `${ENV.api_url}/uploads/news/images`,
    image: `${ENV.api_url}/uploads/news/images`,
    video: `${ENV.api_url}/uploads/news/videos`,
    seo: {
      image: `${ENV.api_url}/uploads/news/seo/images`,
    },
  },
};
