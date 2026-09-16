import { toBanglaNumber } from "./toBanglaNumber";

export const formatCount = (count: number) => {
  if (count >= 1000000) {
    return `${toBanglaNumber((count / 1000000).toFixed(1))}M`;
  } else if (count >= 1000) {
    return `${toBanglaNumber((count / 1000).toFixed(1))}K`;
  }
  return toBanglaNumber(count.toString());
};
