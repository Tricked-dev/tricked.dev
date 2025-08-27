import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/**
 * Rehype plugin that adds preview functionality to image links with #preview hash
 */
export function rehypeImagePreview() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href as string;
        
        if (href.includes('#preview') && isImageUrl(href.replace('#preview', ''))) {
          const imageUrl = href.replace('#preview', '');
          
          node.properties = {
            ...node.properties,
            'data-image-preview': imageUrl,
            'data-preview-enabled': 'true',
            href: imageUrl,
          };
          
          const existingClass = node.properties.className || [];

          //@ts-ignore - No worries here!
          node.properties.className = Array.isArray(existingClass) 
            ? [...existingClass, 'image-preview-link']
            : [existingClass, 'image-preview-link'].filter(Boolean);
        }
      }
    });
  };
}

/**
 * Check if a URL points to an image file
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const cleanUrl = url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? "";
  return imageExtensions.some(ext => cleanUrl.endsWith(ext));
}