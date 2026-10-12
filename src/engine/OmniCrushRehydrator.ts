/**
 * OmniCrushRehydrator
 * Lossless reconstruction engine.
 * Converts OmniCrushedDocument + parameters back into pristine, executable HTML.
 */
import { CssCrusher } from './CssCrusher';
import { HtmlAstCrusher } from './HtmlAstCrusher';
import { ImportMapCrusher } from './ImportMapCrusher';
import { OmniCrushedDocument } from './types';

export class OmniCrushRehydrator {
  private static instance: OmniCrushRehydrator;

  public static getInstance(): OmniCrushRehydrator {
    if (!OmniCrushRehydrator.instance) {
      OmniCrushRehydrator.instance = new OmniCrushRehydrator();
    }
    return OmniCrushRehydrator.instance;
  }

  /**
   * Reconstitute full standalone HTML document
   */
  public rehydrate(
    doc: OmniCrushedDocument,
    options: { minified?: boolean; useHarness?: boolean } = {}
  ): string {
    const minified = options.minified ?? false;
    const useHarness = options.useHarness ?? false;
    const nl = minified ? '' : '\n';

    const htmlCrusher = HtmlAstCrusher.getInstance();
    const cssCrusher = CssCrusher.getInstance();
    const importMapCrusher = ImportMapCrusher.getInstance();

    // 1. Rehydrate Import Maps
    const importMapTags = doc.importMaps.map((im) => {
      const json = importMapCrusher.rehydrate(im);
      return `<script type="importmap">${nl}${json}${nl}</script>`;
    });

    // 2. Rehydrate CSS
    let styleTag = '';
    const cssContent = cssCrusher.rehydrate(doc.css, minified);
    if (cssContent.trim().length > 0) {
      styleTag = `<style>${nl}${cssContent}${nl}</style>`;
    }

    // 3. Rehydrate Scripts
    const scriptTags = doc.scripts.map((script) => {
      const typeAttr = script.type === 'module' ? ' type="module"' : '';
      if (script.src) {
        return `<script${typeAttr} src="${script.src}"></script>`;
      }
      const code = useHarness && script.harnessWrapper ? script.harnessWrapper : script.originalCode;
      return `<script${typeAttr}>${nl}${code}${nl}</script>`;
    });

    // 4. Rehydrate DOM tree
    let bodyOrDocContent = htmlCrusher.rehydrate(doc.domTree, doc.dictionaries, minified);

    // If bodyOrDocContent doesn't contain standard <html or <body tags, wrap it properly
    const hasHtmlTag = /<html[\s>]/i.test(bodyOrDocContent);
    const hasHeadTag = /<head[\s>]/i.test(bodyOrDocContent);
    const hasBodyTag = /<body[\s>]/i.test(bodyOrDocContent);

    if (!hasHtmlTag) {
      // Assemble full document wrapper
      const doctype = doc.metadata.doctype || '<!doctype html>';
      const langAttr = doc.metadata.lang ? ` lang="${doc.metadata.lang}"` : ' lang="en"';
      const titleTag = `<title>${doc.metadata.title}</title>`;
      const charsetTag = `<meta charset="${doc.metadata.charset || 'UTF-8'}" />`;
      const viewportTag = `<meta name="viewport" content="${doc.metadata.viewport || 'width=device-width, initial-scale=1.0'}" />`;

      const headParts = [
        charsetTag,
        viewportTag,
        titleTag,
        ...importMapTags,
        styleTag,
      ].filter(Boolean);

      return `${doctype}
<html${langAttr}>
<head>
${headParts.map((p) => `  ${p}`).join(nl)}
</head>
<body>
${bodyOrDocContent}
${scriptTags.join(nl)}
</body>
</html>`;
    }

    // If document already contained <html> / <head> structure, inject CSS and scripts into appropriate places
    if (hasHeadTag) {
      const headInjection = [...importMapTags, styleTag].filter(Boolean).join(nl);
      bodyOrDocContent = bodyOrDocContent.replace(/<\/head>/i, `${headInjection}${nl}</head>`);
    }

    if (hasBodyTag && scriptTags.length > 0) {
      bodyOrDocContent = bodyOrDocContent.replace(/<\/body>/i, `${scriptTags.join(nl)}${nl}</body>`);
    } else if (scriptTags.length > 0) {
      bodyOrDocContent += nl + scriptTags.join(nl);
    }

    return bodyOrDocContent;
  }
}
