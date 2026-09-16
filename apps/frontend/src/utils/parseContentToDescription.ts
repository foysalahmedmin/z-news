export const getDescription = (content: string): string => {
  if (!content) return "";

  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, " ");

  // Keep Bangla letters, punctuation, numbers, English letters, spaces
  text = text.replace(/[^\u0980-\u09FF0-9a-zA-Z.,!?। ]+/g, " ");

  // Collapse multiple spaces
  text = text.replace(/\s+/g, " ");

  // Split into sentences (including Bangla "।")
  const sentences = text.match(/[^.!?।]+[.!?।]?/g) || [];
  let description = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((description + trimmed).length <= 300) {
      description += trimmed + " ";
    } else break;
  }

  return description.trim() || text.slice(0, 300).trim();
};
