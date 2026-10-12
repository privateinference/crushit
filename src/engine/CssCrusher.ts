/**
 * CssCrusher
 * Lossless CSS AST Crusher and Declaration Deduplicator.
 * Converts stylesheets and inline styles into indexed token dictionaries.
 */
import { TokenDictionaryManager } from './TokenDictionaryManager';
import { CrushedCss, CrushedCssRule, CrushedKeyframe, CrushedKeyframeStep } from './types';

export class CssCrusher {
  private static instance: CssCrusher;

  public static getInstance(): CssCrusher {
    if (!CssCrusher.instance) {
      CssCrusher.instance = new CssCrusher();
    }
    return CssCrusher.instance;
  }

  /**
   * Parse and crush raw CSS text
   */
  public crush(rawCss: string): CrushedCss {
    const propDict = new TokenDictionaryManager();
    const valDict = new TokenDictionaryManager();
    const rules: CrushedCssRule[] = [];
    const keyframes: CrushedKeyframe[] = [];
    const rawAtRules: string[] = [];

    // Strip comments cleanly
    const sanitizedCss = rawCss.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    // Regex for blocks: @media, @keyframes, regular rules
    const blockRegex = /([^{}]+)\{([^{}]+)\}/g;
    const mediaBlockRegex = /@media[^{]+\{(?:[^{}]+|{[^{}]+})*\}/gi;

    // Handle @media queries first
    let remainingCss = sanitizedCss;
    const mediaMatches = sanitizedCss.match(mediaBlockRegex);
    if (mediaMatches) {
      for (const mediaBlock of mediaMatches) {
        remainingCss = remainingCss.replace(mediaBlock, '');
        const headerEnd = mediaBlock.indexOf('{');
        const mediaQuery = mediaBlock.substring(0, headerEnd).trim();
        const innerContent = mediaBlock.substring(headerEnd + 1, mediaBlock.lastIndexOf('}')).trim();

        let innerMatch: RegExpExecArray | null;
        const innerRegex = /([^{}]+)\{([^{}]+)\}/g;
        while ((innerMatch = innerRegex.exec(innerContent)) !== null) {
          const rawSelectors = innerMatch[1].trim();
          const rawDeclarations = innerMatch[2].trim();
          const selectors = rawSelectors.split(',').map((s) => s.trim()).filter(Boolean);
          const declarations = this.parseDeclarations(rawDeclarations, propDict, valDict);
          if (selectors.length > 0 && declarations.length > 0) {
            rules.push({ selectors, declarations, media: mediaQuery });
          }
        }
      }
    }

    // Handle @keyframes
    const keyframesRegex = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*\}/gi;
    let kfMatch: RegExpExecArray | null;
    while ((kfMatch = keyframesRegex.exec(remainingCss)) !== null) {
      const kfName = kfMatch[1].trim();
      const kfContent = kfMatch[2].trim();
      const steps: CrushedKeyframeStep[] = [];

      let stepMatch: RegExpExecArray | null;
      while ((stepMatch = blockRegex.exec(kfContent)) !== null) {
        const step = stepMatch[1].trim();
        const decls = this.parseDeclarations(stepMatch[2], propDict, valDict);
        steps.push({ step, declarations: decls });
      }
      keyframes.push({ name: kfName, steps });
    }
    remainingCss = remainingCss.replace(/@keyframes[\s\S]*?\}\s*\}/gi, '');

    // Handle other @rules like @import, @charset
    const atRuleRegex = /@(import|charset)[^;]+;/gi;
    let atMatch: RegExpExecArray | null;
    while ((atMatch = atRuleRegex.exec(remainingCss)) !== null) {
      rawAtRules.push(atMatch[0].trim());
    }
    remainingCss = remainingCss.replace(atRuleRegex, '');

    // Handle standard CSS rules
    let ruleMatch: RegExpExecArray | null;
    const standardRegex = /([^{}]+)\{([^{}]+)\}/g;
    while ((ruleMatch = standardRegex.exec(remainingCss)) !== null) {
      const rawSelectors = ruleMatch[1].trim();
      const rawDeclarations = ruleMatch[2].trim();
      const selectors = rawSelectors.split(',').map((s) => s.trim()).filter(Boolean);
      const declarations = this.parseDeclarations(rawDeclarations, propDict, valDict);

      if (selectors.length > 0 && declarations.length > 0) {
        rules.push({ selectors, declarations });
      }
    }

    return {
      properties: propDict.toArray(),
      values: valDict.toArray(),
      rules,
      keyframes,
      rawAtRules,
    };
  }

  /**
   * Parse inline style string (e.g. "color: red; font-size: 14px")
   */
  public parseInlineStyle(
    styleText: string,
    propDict: TokenDictionaryManager,
    valDict: TokenDictionaryManager
  ): [number, number][] {
    return this.parseDeclarations(styleText, propDict, valDict);
  }

  /**
   * Helper to parse "prop: value; prop: value" into indices
   */
  private parseDeclarations(
    declarationsText: string,
    propDict: TokenDictionaryManager,
    valDict: TokenDictionaryManager
  ): [number, number][] {
    const list: [number, number][] = [];
    const items = declarationsText.split(';').map((s) => s.trim()).filter(Boolean);

    for (const item of items) {
      const colonIndex = item.indexOf(':');
      if (colonIndex > 0) {
        const prop = item.substring(0, colonIndex).trim().toLowerCase();
        const val = item.substring(colonIndex + 1).trim();
        if (prop && val) {
          const pIdx = propDict.add(prop);
          const vIdx = valDict.add(val);
          list.push([pIdx, vIdx]);
        }
      }
    }
    return list;
  }

  /**
   * Rehydrate CrushedCss back into valid CSS string
   */
  public rehydrate(crushed: CrushedCss, minified = false): string {
    const lines: string[] = [];
    const sep = minified ? '' : '\n';
    const indent = minified ? '' : '  ';
    const declSep = minified ? ';' : ';\n';

    // 1. Raw at-rules
    if (crushed.rawAtRules && crushed.rawAtRules.length > 0) {
      lines.push(crushed.rawAtRules.join(sep));
    }

    // 2. Format declarations
    const formatDecls = (decls: [number, number][], pad = indent): string => {
      return decls
        .map(([pIdx, vIdx]) => {
          const prop = crushed.properties[pIdx] || '';
          const val = crushed.values[vIdx] || '';
          return minified ? `${prop}:${val}` : `${pad}${prop}: ${val}`;
        })
        .join(declSep);
    };

    // 3. Rules grouped by media query
    const standardRules = crushed.rules.filter((r) => !r.media);
    const mediaGroups = new Map<string, CrushedCssRule[]>();
    crushed.rules
      .filter((r) => Boolean(r.media))
      .forEach((r) => {
        const list = mediaGroups.get(r.media!) || [];
        list.push(r);
        mediaGroups.set(r.media!, list);
      });

    // Standard rules
    for (const rule of standardRules) {
      const sel = rule.selectors.join(minified ? ',' : ', ');
      const declStr = formatDecls(rule.declarations);
      if (minified) {
        lines.push(`${sel}{${declStr}}`);
      } else {
        lines.push(`${sel} {\n${declStr};\n}`);
      }
    }

    // Media query blocks
    for (const [media, mRules] of mediaGroups.entries()) {
      if (minified) {
        const inner = mRules
          .map((r) => `${r.selectors.join(',')}{${formatDecls(r.declarations)}}`)
          .join('');
        lines.push(`${media}{${inner}}`);
      } else {
        const inner = mRules
          .map((r) => `  ${r.selectors.join(', ')} {\n${formatDecls(r.declarations, '    ')};\n  }`)
          .join('\n');
        lines.push(`${media} {\n${inner}\n}`);
      }
    }

    // Keyframes
    for (const kf of crushed.keyframes || []) {
      if (minified) {
        const inner = kf.steps
          .map((s) => `${s.step}{${formatDecls(s.declarations)}}`)
          .join('');
        lines.push(`@keyframes ${kf.name}{${inner}}`);
      } else {
        const inner = kf.steps
          .map((s) => `  ${s.step} {\n${formatDecls(s.declarations, '    ')};\n  }`)
          .join('\n');
        lines.push(`@keyframes ${kf.name} {\n${inner}\n}`);
      }
    }

    return lines.join(sep);
  }
}
