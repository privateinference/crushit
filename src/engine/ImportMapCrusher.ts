/**
 * ImportMapCrusher
 * Extracts, analyzes, and deduplicates repeated CDN base URLs in import maps.
 */
import { CrushedImportMap, CrushedImportMapItem } from './types';

export class ImportMapCrusher {
  private static instance: ImportMapCrusher;

  // Known popular CDN root patterns for intelligent early detection
  private static readonly COMMON_CDN_PATTERNS = [
    'https://esm.sh/',
    'https://cdn.jsdelivr.net/npm/',
    'https://cdn.jsdelivr.net/gh/',
    'https://unpkg.com/',
    'https://ga.jspm.io/npm:',
    'https://cdnjs.cloudflare.com/ajax/libs/',
    'https://cdn.skypack.dev/',
    'https://esm.run/',
    'https://cdn.tailwindcss.com/'
  ];

  public static getInstance(): ImportMapCrusher {
    if (!ImportMapCrusher.instance) {
      ImportMapCrusher.instance = new ImportMapCrusher();
    }
    return ImportMapCrusher.instance;
  }

  /**
   * Process raw import map JSON string or object into crushed representation
   */
  public crush(rawImportMapText: string): CrushedImportMap {
    let parsed: { imports?: Record<string, string>; scopes?: Record<string, Record<string, string>> };
    try {
      parsed = typeof rawImportMapText === 'string' ? JSON.parse(rawImportMapText) : rawImportMapText;
    } catch {
      return { cdnPrefixes: [], imports: {} };
    }

    const rawImports = parsed.imports || {};
    const rawScopes = parsed.scopes || {};

    // Collect all URL targets
    const allUrls: string[] = [];
    Object.values(rawImports).forEach((val) => {
      if (typeof val === 'string') allUrls.push(val);
    });
    Object.values(rawScopes).forEach((scopeGroup) => {
      if (typeof scopeGroup === 'object' && scopeGroup !== null) {
        Object.values(scopeGroup).forEach((val) => {
          if (typeof val === 'string') allUrls.push(val);
        });
      }
    });

    // Detect candidate CDN prefixes
    const prefixCount = new Map<string, number>();

    // 1. Check known prefixes
    ImportMapCrusher.COMMON_CDN_PATTERNS.forEach((knownPrefix) => {
      const matchCount = allUrls.filter((u) => u.startsWith(knownPrefix)).length;
      if (matchCount > 0) {
        prefixCount.set(knownPrefix, matchCount);
      }
    });

    // 2. Discover custom repetitive prefixes (e.g., https://my-cdn.com/pkg/)
    allUrls.forEach((url) => {
      try {
        const parsedUrl = new URL(url);
        // Candidate: protocol + host + initial segment
        const segments = parsedUrl.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const candidate1 = `${parsedUrl.origin}/${segments[0]}/`;
          prefixCount.set(candidate1, (prefixCount.get(candidate1) || 0) + 1);
        }
        const candidateOrigin = `${parsedUrl.origin}/`;
        prefixCount.set(candidateOrigin, (prefixCount.get(candidateOrigin) || 0) + 1);
      } catch {
        // Not a full URL, skip
      }
    });

    // Select prefixes with at least 1 known match or 2+ custom occurrences, sorted by longest prefix first
    const selectedPrefixes = Array.from(prefixCount.entries())
      .filter(([prefix, count]) => {
        const isKnown = ImportMapCrusher.COMMON_CDN_PATTERNS.includes(prefix);
        return isKnown || count >= 2;
      })
      .sort((a, b) => b[0].length - a[0].length)
      .map(([prefix]) => prefix);

    // Compress import mapping
    const compressUrl = (url: string): CrushedImportMapItem | string => {
      for (let i = 0; i < selectedPrefixes.length; i++) {
        const prefix = selectedPrefixes[i];
        if (url.startsWith(prefix)) {
          return {
            prefixIdx: i,
            path: url.slice(prefix.length),
          };
        }
      }
      return url;
    };

    const crushedImports: Record<string, CrushedImportMapItem | string> = {};
    for (const [key, target] of Object.entries(rawImports)) {
      if (typeof target === 'string') {
        crushedImports[key] = compressUrl(target);
      }
    }

    const crushedScopes: Record<string, Record<string, CrushedImportMapItem | string>> = {};
    for (const [scopeKey, scopeGroup] of Object.entries(rawScopes)) {
      if (typeof scopeGroup === 'object' && scopeGroup !== null) {
        crushedScopes[scopeKey] = {};
        for (const [k, target] of Object.entries(scopeGroup)) {
          if (typeof target === 'string') {
            crushedScopes[scopeKey][k] = compressUrl(target);
          }
        }
      }
    }

    return {
      cdnPrefixes: selectedPrefixes,
      imports: crushedImports,
      scopes: Object.keys(crushedScopes).length > 0 ? crushedScopes : undefined,
    };
  }

  /**
   * Reconstitute crushed import map into pristine JSON string
   */
  public rehydrate(crushed: CrushedImportMap): string {
    const uncompressUrl = (item: CrushedImportMapItem | string): string => {
      if (typeof item === 'string') return item;
      const prefix = crushed.cdnPrefixes[item.prefixIdx] || '';
      return `${prefix}${item.path}`;
    };

    const restoredImports: Record<string, string> = {};
    for (const [key, target] of Object.entries(crushed.imports || {})) {
      restoredImports[key] = uncompressUrl(target);
    }

    const restoredScopes: Record<string, Record<string, string>> = {};
    if (crushed.scopes) {
      for (const [scopeKey, scopeGroup] of Object.entries(crushed.scopes)) {
        restoredScopes[scopeKey] = {};
        for (const [k, target] of Object.entries(scopeGroup)) {
          restoredScopes[scopeKey][k] = uncompressUrl(target);
        }
      }
    }

    const output: { imports: Record<string, string>; scopes?: Record<string, Record<string, string>> } = {
      imports: restoredImports,
    };
    if (Object.keys(restoredScopes).length > 0) {
      output.scopes = restoredScopes;
    }

    return JSON.stringify(output, null, 2);
  }

  /**
   * Build self-contained client-side loader script that registers the import map dynamically
   */
  public generateClientHarness(crushed: CrushedImportMap): string {
    return `<!-- OmniCrush Import Map Harness -->
<script type="importmap">
${this.rehydrate(crushed)}
</script>`;
  }
}
