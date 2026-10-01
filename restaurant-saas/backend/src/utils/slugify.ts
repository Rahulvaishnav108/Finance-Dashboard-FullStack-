// src/utils/slugify.ts
// URL-safe slug generator for restaurant names, menu items, etc.

/**
 * Convert a string to a URL-safe slug.
 * Example: "Pizza Palace & Grill" → "pizza-palace-grill"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word chars (except hyphens)
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Generate a unique slug by appending a random suffix.
 * Used when a slug collision is detected.
 */
export function uniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
