/**
 *
 * @param {string} s
 * @param {Error} err Specific error message
 * @todo Move to own class
 * @returns {string}
 */
export default function _ (s, err) {
  return s + (err ? ` (${err.message})` : '');
}
