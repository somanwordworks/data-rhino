// lib/sentiment.js

/**
 * Maps numeric ratings (or sentiment scores) to buckets
 * Used in summary.js to calculate yearly sentiment
 */
export function ratingToBucket(rating) {
  if (typeof rating !== "number") return "negative";

  if (rating >= 4) return "positive";   // good reviews
  if (rating === 3) return "neutral";   // average reviews
  return "negative";                    // 1-2 star or no rating
}
