export const toBanglaNumber = (num: number | string): string => {
  const engToBngMap: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };

  return num
    .toString()
    .split("")
    .map((digit) => engToBngMap[digit] || digit)
    .join("");
};
