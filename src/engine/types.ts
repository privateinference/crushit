/**
 * OmniCrush AST - Core Domain Types
 * Domain-Driven Design for Lossless AST Minification, Parametric Templating,
 * and AI-Powered Re-skinning.
 */

export interface TokenDictionary<T = string> {
  tokens: T[];
  indices: Map<T, number>;
}

export interface HtmlAstNode {
  /** Tag index into dictionaries.tags, or -1 for text/comment/doctype */
  t?: number;
  /** Attribute name index -> attribute value index */
  a?: Record<number, number>;
  /** Child nodes or strings */
  c?: (HtmlAstNode | string)[];
  /** Inline text content for text nodes */
  txt?: string;
  /** Special node flag: 1 = comment, 2 = doctype, 3 = raw verbatim (svg/canvas/etc) */
  type?: 'element' | 'text' | 'comment' | 'doctype';
  /** Parametric binding tags attached to this node */
  bindings?: Record<string, string>;
}

export interface CrushedCssRule {
  selectors: string[];
  /** Array of [propertyIndex, valueIndex] */
  declarations: [number, number][];
  media?: string;
}

export interface CrushedKeyframeStep {
  step: string;
  declarations: [number, number][];
}

export interface CrushedKeyframe {
  name: string;
  steps: CrushedKeyframeStep[];
}

export interface CrushedCss {
  properties: string[];
  values: string[];
  rules: CrushedCssRule[];
  keyframes: CrushedKeyframe[];
  rawAtRules: string[];
}

export interface CrushedImportMapItem {
  prefixIdx: number;
  path: string;
}

export interface CrushedImportMap {
  cdnPrefixes: string[];
  imports: Record<string, CrushedImportMapItem | string>;
  scopes?: Record<string, Record<string, CrushedImportMapItem | string>>;
}

export interface CrushedScript {
  id: string;
  type: 'module' | 'classic' | 'importmap';
  src?: string;
  astSummary?: {
    functions: string[];
    classes: string[];
    identifiers: string[];
    stringLiterals: string[];
    singletonHelpers: string[];
    nodeCount: number;
  };
  originalCode: string;
  minifiedCode: string;
  harnessWrapper?: string;
}

export type ParametricType = 'color' | 'text' | 'number' | 'select' | 'boolean';

export interface ParametricTarget {
  targetType: 'attribute' | 'text' | 'css-rule' | 'script-literal';
  path: string;
  key?: string;
  originalValue: string;
}

export interface ParametricVariable {
  id: string;
  label: string;
  type: ParametricType;
  defaultValue: string | number | boolean;
  currentValue: string | number | boolean;
  category: 'theme' | 'typography' | 'content' | 'layout' | 'scientific';
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  targets: ParametricTarget[];
}

export interface CompressionStats {
  originalBytes: number;
  minifiedHtmlBytes: number;
  crushedJsonBytes: number;
  estimatedGzipBytes: number;
  originalTokens: number;
  crushedTokens: number;
  tokenReductionPercent: number;
  byteReductionPercent: number;
  uniqueTagsCount: number;
  uniqueAttrsCount: number;
  uniqueValuesCount: number;
  uniqueCssPropsCount: number;
  uniqueCssValuesCount: number;
  cdnUrlsDeduplicated: number;
  scriptLiteralsDeduplicated: number;
}

export interface OmniCrushedDocument {
  version: '1.0.0';
  timestamp: number;
  metadata: {
    title: string;
    description?: string;
    charset: string;
    viewport?: string;
    doctype: string;
    lang?: string;
  };
  dictionaries: {
    tags: string[];
    attrNames: string[];
    attrValues: string[];
    classTokens: string[];
  };
  domTree: HtmlAstNode;
  css: CrushedCss;
  importMaps: CrushedImportMap[];
  scripts: CrushedScript[];
  parametrics: ParametricVariable[];
  stats: CompressionStats;
}
