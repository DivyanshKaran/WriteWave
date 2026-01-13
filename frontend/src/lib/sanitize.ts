import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Unsanitized HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(
  dirty: string,
  options?: DOMPurify.Config
): string {
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "del",
      "ins",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "code",
      "pre",
      "blockquote",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "title", "alt", "src", "class"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  const config = { ...defaultConfig, ...options };
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Format markdown-like content and sanitize it
 * @param content - Raw content with markdown syntax
 * @returns Sanitized HTML string
 */
export function formatAndSanitizeContent(content: string): string {
  // Basic markdown-like formatting
  let formatted = content
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith("<p>")) {
    formatted = `<p>${formatted}</p>`;
  }

  // Sanitize the formatted content
  return sanitizeHTML(formatted);
}

/**
 * Sanitize user input for display (strips all HTML)
 * @param input - User input string
 * @returns Plain text with HTML entities escaped
 */
export function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize content for article preview (limited tags)
 * @param content - Article content
 * @returns Sanitized HTML with limited formatting
 */
export function sanitizeArticlePreview(content: string): string {
  return sanitizeHTML(content, {
    ALLOWED_TAGS: ["p", "br", "strong", "em"],
    ALLOWED_ATTR: [],
  });
}
