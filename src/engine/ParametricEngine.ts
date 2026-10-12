/**
 * ParametricEngine
 * Detects parametric opportunities across HTML, CSS, and JS AST.
 * Manages live parametric variables, reactive bindings, and AI designer schemas.
 */
import {
  CrushedCss,
  HtmlAstNode,
  OmniCrushedDocument,
  ParametricVariable,
} from './types';

export class ParametricEngine {
  private static instance: ParametricEngine;

  public static getInstance(): ParametricEngine {
    if (!ParametricEngine.instance) {
      ParametricEngine.instance = new ParametricEngine();
    }
    return ParametricEngine.instance;
  }

  /**
   * Discover and auto-extract parametric variables from crushed document
   */
  public discoverVariables(
    doc: {
      domTree: HtmlAstNode;
      css: CrushedCss;
      dictionaries: { tags: string[]; attrNames: string[]; attrValues: string[] };
      metadata: { title: string };
    }
  ): ParametricVariable[] {
    const variables: ParametricVariable[] = [];
    const colorRegex = /^#([0-9a-f]{3,8})$|^rgba?\([^)]+\)$|^hsla?\([^)]+\)$/i;
    const hexColorInlineRegex = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;

    // 1. Discover colors in CSS values & attributes
    const detectedColors = new Map<string, number>();

    doc.css.values.forEach((val) => {
      if (colorRegex.test(val)) {
        detectedColors.set(val, (detectedColors.get(val) || 0) + 1);
      } else {
        const matches = val.match(hexColorInlineRegex);
        if (matches) {
          matches.forEach((m) => detectedColors.set(m, (detectedColors.get(m) || 0) + 1));
        }
      }
    });

    doc.dictionaries.attrValues.forEach((val) => {
      const matches = val.match(hexColorInlineRegex);
      if (matches) {
        matches.forEach((m) => detectedColors.set(m, (detectedColors.get(m) || 0) + 1));
      }
    });

    // Sort detected colors by occurrence
    const sortedColors = Array.from(detectedColors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedColors.forEach(([color, count], idx) => {
      const label =
        idx === 0
          ? 'Primary Brand Color'
          : idx === 1
          ? 'Secondary Accent Color'
          : idx === 2
          ? 'Background Canvas Tone'
          : `Color Palette #${idx + 1}`;

      variables.push({
        id: `param_color_${idx + 1}`,
        label,
        type: 'color',
        defaultValue: color,
        currentValue: color,
        category: 'theme',
        description: `Used ${count} times across styles and attributes`,
        targets: [
          {
            targetType: 'css-rule',
            path: 'css.values',
            originalValue: color,
          },
        ],
      });
    });

    // 2. Discover document Title & Headline
    if (doc.metadata.title) {
      variables.push({
        id: 'param_page_title',
        label: 'Document Title',
        type: 'text',
        defaultValue: doc.metadata.title,
        currentValue: doc.metadata.title,
        category: 'content',
        description: 'Page title and primary headline text',
        targets: [
          {
            targetType: 'text',
            path: 'metadata.title',
            originalValue: doc.metadata.title,
          },
        ],
      });
    }

    // 3. Scan DOM for text nodes that look like headlines or buttons
    let textNodeCount = 0;
    const scanDomForText = (node: HtmlAstNode | string) => {
      if (typeof node === 'string') {
        const trimmed = node.trim();
        // Look for prominent titles, badges, or scientific identifiers
        if (
          trimmed.length >= 3 &&
          trimmed.length <= 40 &&
          textNodeCount < 3 &&
          !trimmed.includes('<') &&
          !trimmed.includes('{')
        ) {
          // Detect scientific accession codes (e.g., P04637, 7KRR, rs121913343)
          const isBioCode = /^(P\d{5}|[1-9][A-Za-z0-9]{3}|rs\d+|CHEMBL\d+|CID\s*\d+)$/i.test(trimmed);
          const isScientific = isBioCode || /(alphafold|variant|pathway|potency|affinity|affinity)/i.test(trimmed);

          variables.push({
            id: `param_content_${textNodeCount + 1}`,
            label: isScientific ? `Scientific Identifier: ${trimmed}` : `Prominent Text: "${trimmed.slice(0, 16)}..."`,
            type: 'text',
            defaultValue: trimmed,
            currentValue: trimmed,
            category: isScientific ? 'scientific' : 'content',
            description: `Live editable text node`,
            targets: [
              {
                targetType: 'text',
                path: 'domTree',
                originalValue: trimmed,
              },
            ],
          });
          textNodeCount++;
        }
      } else if (node.c) {
        node.c.forEach(scanDomForText);
      }
    };

    if (doc.domTree.c) {
      doc.domTree.c.forEach(scanDomForText);
    }

    // 4. Discover Layout / Spacing / Border Radius parameters
    const detectedRadii = doc.css.values.filter((v) => /^\d+(px|rem|em|%)$/.test(v));
    if (detectedRadii.length > 0) {
      const radiusVal = detectedRadii[0];
      const numericVal = parseInt(radiusVal, 10) || 8;
      variables.push({
        id: 'param_border_radius',
        label: 'Corner Rounding (Radius)',
        type: 'number',
        defaultValue: numericVal,
        currentValue: numericVal,
        min: 0,
        max: 32,
        step: 2,
        unit: 'px',
        category: 'layout',
        description: 'Corner radius for cards and buttons',
        targets: [
          {
            targetType: 'css-rule',
            path: 'css.values',
            originalValue: radiusVal,
          },
        ],
      });
    }

    return variables;
  }

  /**
   * Apply active parameters to crushed document, returning a mutated clone
   */
  public applyParameters(
    doc: OmniCrushedDocument,
    parameters: ParametricVariable[]
  ): OmniCrushedDocument {
    // Deep clone doc
    const cloned: OmniCrushedDocument = JSON.parse(JSON.stringify(doc));

    // Create lookup of originalValue -> currentValue
    const colorReplacements = new Map<string, string>();
    const textReplacements = new Map<string, string>();

    parameters.forEach((param) => {
      if (param.currentValue !== undefined && param.currentValue !== param.defaultValue) {
        if (param.type === 'color' && typeof param.currentValue === 'string') {
          colorReplacements.set(String(param.defaultValue), param.currentValue);
        } else if (param.type === 'text' && typeof param.currentValue === 'string') {
          textReplacements.set(String(param.defaultValue), param.currentValue);
          if (param.id === 'param_page_title') {
            cloned.metadata.title = param.currentValue;
          }
        } else if (param.type === 'number') {
          colorReplacements.set(
            `${param.defaultValue}${param.unit || 'px'}`,
            `${param.currentValue}${param.unit || 'px'}`
          );
        }
      }
    });

    // Replace in CSS values
    if (colorReplacements.size > 0) {
      cloned.css.values = cloned.css.values.map((v) => {
        let updated = v;
        for (const [orig, repl] of colorReplacements.entries()) {
          if (updated === orig) {
            updated = repl;
          } else {
            updated = updated.split(orig).join(repl);
          }
        }
        return updated;
      });

      // Replace in attribute values
      cloned.dictionaries.attrValues = cloned.dictionaries.attrValues.map((v) => {
        let updated = v;
        for (const [orig, repl] of colorReplacements.entries()) {
          updated = updated.split(orig).join(repl);
        }
        return updated;
      });
    }

    // Replace in DOM text nodes
    if (textReplacements.size > 0) {
      const replaceInNode = (node: HtmlAstNode | string): HtmlAstNode | string => {
        if (typeof node === 'string') {
          let updated = node;
          for (const [orig, repl] of textReplacements.entries()) {
            if (updated.includes(orig)) {
              updated = updated.split(orig).join(repl);
            }
          }
          return updated;
        }
        if (node.c) {
          node.c = node.c.map(replaceInNode);
        }
        return node;
      };

      if (cloned.domTree.c) {
        cloned.domTree.c = cloned.domTree.c.map(replaceInNode);
      }
    }

    cloned.parametrics = parameters;
    return cloned;
  }
}
