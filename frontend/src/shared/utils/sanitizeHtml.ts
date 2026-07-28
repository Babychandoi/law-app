import DOMPurify from 'dompurify';

/**
 * Sanitize rich-text HTML (React Quill output from the CMS) before it is passed to
 * dangerouslySetInnerHTML. DOMPurify's default profile already strips <script>, event handlers
 * (onerror/onclick...), javascript: URLs and other XSS vectors while keeping normal formatting.
 *
 * We additionally force any link that opens a new tab to carry rel="noopener noreferrer" to avoid
 * reverse-tabnabbing.
 */
let hookRegistered = false;

function ensureHook(): void {
  if (hookRegistered) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hookRegistered = true;
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  ensureHook();
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
  });
}
