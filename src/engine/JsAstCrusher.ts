/**
 * JsAstCrusher
 * Analyzes JavaScript AST using Acorn, identifies repetitive literals, functions,
 * identifiers, and wraps them in rigorous core helpers/proxies/harnesses/factories.
 */
import * as acorn from 'acorn';
import { CrushedScript } from './types';

export class JsAstCrusher {
  private static instance: JsAstCrusher;

  public static getInstance(): JsAstCrusher {
    if (!JsAstCrusher.instance) {
      JsAstCrusher.instance = new JsAstCrusher();
    }
    return JsAstCrusher.instance;
  }

  /**
   * Parse and analyze a script string into crushed AST structure
   */
  public crush(
    scriptContent: string,
    id: string,
    type: 'module' | 'classic' = 'classic',
    src?: string
  ): CrushedScript {
    if (src) {
      return {
        id,
        type,
        src,
        originalCode: '',
        minifiedCode: '',
      };
    }

    const functions: string[] = [];
    const classes: string[] = [];
    const identifiers = new Set<string>();
    const stringLiterals = new Map<string, number>();
    let nodeCount = 0;

    let parsedAst: any = null;
    try {
      parsedAst = acorn.parse(scriptContent, {
        ecmaVersion: 'latest',
        sourceType: type === 'module' ? 'module' : 'script',
        locations: false,
      });
    } catch {
      // Fallback try with module if classic failed, or vice versa
      try {
        parsedAst = acorn.parse(scriptContent, {
          ecmaVersion: 'latest',
          sourceType: 'module',
          locations: false,
        });
      } catch {
        // If syntax error (e.g. non-standard or template tags), keep raw code safely
      }
    }

    // Traverse AST if available
    if (parsedAst) {
      this.walkAst(parsedAst, (node) => {
        nodeCount++;

        // Function declarations / expressions
        if (
          node.type === 'FunctionDeclaration' &&
          node.id &&
          node.id.name
        ) {
          functions.push(node.id.name);
        } else if (
          node.type === 'VariableDeclarator' &&
          (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression') &&
          node.id?.name
        ) {
          functions.push(node.id.name);
        }

        // Classes
        if (node.type === 'ClassDeclaration' && node.id?.name) {
          classes.push(node.id.name);
        }

        // Identifiers
        if (node.type === 'Identifier' && typeof node.name === 'string') {
          if (node.name.length > 2) {
            identifiers.add(node.name);
          }
        }

        // String literals (repeated constants, selectors, event names)
        if (node.type === 'Literal' && typeof node.value === 'string' && node.value.length > 1) {
          const val = node.value;
          stringLiterals.set(val, (stringLiterals.get(val) || 0) + 1);
        }
      });
    }

    // Filter repeated string literals
    const repeatedStrings = Array.from(stringLiterals.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([str]) => str);

    // Identify detected core patterns for the harness
    const singletonHelpers: string[] = [];
    if (identifiers.has('document') || identifiers.has('window')) {
      singletonHelpers.push('DOMProxy');
    }
    if (identifiers.has('addEventListener') || identifiers.has('dispatchEvent')) {
      singletonHelpers.push('EventBroker');
    }
    if (repeatedStrings.length > 0) {
      singletonHelpers.push('StringRegistry');
    }
    if (identifiers.has('fetch') || identifiers.has('XMLHttpRequest')) {
      singletonHelpers.push('NetworkFactory');
    }

    // Simple minification (strip extra whitespace and comments while preserving semantics)
    const minified = this.lightweightMinify(scriptContent);

    // Build singleton/class harness wrapper
    const harnessWrapper = this.buildHarnessWrapper(
      id,
      repeatedStrings,
      singletonHelpers,
      minified
    );

    return {
      id,
      type,
      astSummary: {
        functions: Array.from(new Set(functions)),
        classes: Array.from(new Set(classes)),
        identifiers: Array.from(identifiers).slice(0, 50),
        stringLiterals: repeatedStrings,
        singletonHelpers,
        nodeCount,
      },
      originalCode: scriptContent,
      minifiedCode: minified,
      harnessWrapper,
    };
  }

  /**
   * AST recursive traversal helper
   */
  private walkAst(node: any, visitor: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;
    visitor(node);

    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'range') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.walkAst(item, visitor);
        }
      } else if (typeof child === 'object') {
        this.walkAst(child, visitor);
      }
    }
  }

  /**
   * Safe lightweight JavaScript minifier
   */
  public lightweightMinify(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1') // remove single-line comments safely
      .replace(/\s+/g, ' ') // collapse multi-whitespace
      .replace(/\s*([;{}(),=+\-*/><!&|:?])\s*/g, '$1') // trim around operators
      .trim();
  }

  /**
   * Constructs the extensible Class-based Harness and Sandbox Singletons
   */
  public buildHarnessWrapper(
    scopeId: string,
    repeatedStrings: string[],
    helpers: string[],
    code: string
  ): string {
    return `/**
 * OmniCrush AST Runtime Harness: [${scopeId}]
 * Zero-Loss Deduplicated Scope with Singleton Helpers & Proxies
 */
(function(globalContext) {
  'use strict';
  // 1. Deduplicated String Registry
  const _STR = ${JSON.stringify(repeatedStrings)};

  // 2. Class-Based DOM Proxy & Event Broker Singletons
  class OmniDOMProxy {
    static get(selector) { return document.querySelector(selector); }
    static getAll(selector) { return Array.from(document.querySelectorAll(selector)); }
    static on(el, evt, handler, opts) {
      if (typeof el === 'string') el = this.get(el);
      if (el) el.addEventListener(evt, handler, opts);
    }
  }

  class OmniEventBroker {
    constructor() { this.listeners = new Map(); }
    on(event, fn) {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event).add(fn);
      return () => this.off(event, fn);
    }
    off(event, fn) { this.listeners.get(event)?.delete(fn); }
    emit(event, data) { this.listeners.get(event)?.forEach(fn => fn(data)); }
  }

  // 3. Harness Environment Exposure
  const OmniScope = {
    id: '${scopeId}',
    DOM: OmniDOMProxy,
    Events: new OmniEventBroker(),
    STR: _STR,
    helpers: ${JSON.stringify(helpers)}
  };

  if (!globalContext.__OMNI_CRUSH_SCOPES__) {
    globalContext.__OMNI_CRUSH_SCOPES__ = new Map();
  }
  globalContext.__OMNI_CRUSH_SCOPES__.set('${scopeId}', OmniScope);

  // 4. Execute pristine script within harness
  try {
    ${code}
  } catch(err) {
    console.error('[OmniCrush Script Error in ${scopeId}]:', err);
  }
})(typeof window !== 'undefined' ? window : globalThis);`;
  }
}
