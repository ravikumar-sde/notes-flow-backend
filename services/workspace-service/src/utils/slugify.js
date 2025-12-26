/**
 * Convert a string to a URL-friendly slug
 * @param {string} input - The string to slugify
 * @returns {string} - The slugified string
 */
function slugify(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = {
  slugify,
};

