/**
 * HtmlAstCrusher
 * Parses HTML into a compact, deduplicated DOM tree using htmlparser2.
 * Separates styles, scripts, and import maps to specialized crushers.
 */
import * as htmlparser2 from 'htmlparser2';
import { TokenDictionaryManager } from './TokenDictionaryManager';
import { HtmlAstNode } from './types';

export interface RawHtmlParseResult {
  metadata: {
    title: string;
    description?: string;
    charset: string;
    viewport?: string;
    doctype: string;
    lang?: string;
  };
  domTree: HtmlAstNode;
  inlineStyles: string[];
  importMaps: string[];
  inlineScripts: { id: string; type: 'module' | 'classic'; content: string; src?: string }[];
  dictionaries: {
    tags: string[];
    attrNames: string[];
    attrValues: string[];
    classTokens: string[];
  };
}

export class HtmlAstCrusher {
  private static instance: HtmlAstCrusher;

  public static getInstance(): HtmlAstCrusher {
    if (!HtmlAstCrusher.instance) {
      HtmlAstCrusher.instance = new HtmlAstCrusher();
    }
    return HtmlAstCrusher.instance;
  }

  /**
   * Parse raw HTML text and compress into AST
   */
  public crush(rawHtml: string): RawHtmlParseResult {
    const tagDict = new TokenDictionaryManager();
    const attrNameDict = new TokenDictionaryManager();
    const attrValDict = new TokenDictionaryManager();
    const classTokenDict = new TokenDictionaryManager();

    const inlineStyles: string[] = [];
    const importMaps: string[] = [];
    const inlineScripts: { id: string; type: 'module' | 'classic'; content: string; src?: string }[] = [];

    let scriptCounter = 0;
    let doctype = '<!doctype html>';
    let title = 'Untitled Document';
    let charset = 'UTF-8';
    let viewport = 'width=device-width, initial-scale=1.0';
    let lang = 'en';

    // Parse DOCTYPE if present at head of document
    const doctypeMatch = rawHtml.match(/<!DOCTYPE\s+[^>]+>/i);
    if (doctypeMatch) {
      doctype = doctypeMatch[0];
    }

    // Build DOM structure with htmlparser2 DOMHandler or Parser
    const rootNode: HtmlAstNode = {
      t: tagDict.add('root'),
      c: [],
    };

    const nodeStack: HtmlAstNode[] = [rootNode];

    let currentScriptTag: { type: 'module' | 'classic' | 'importmap'; src?: string; text: string } | null = null;
    let currentStyleTag: { text: string } | null = null;

    const parser = new htmlparser2.Parser(
      {
        onprocessinginstruction(name, data) {
          if (name.toLowerCase() === '!doctype') {
            doctype = `<${data}>`;
          }
        },
        onopentag(name, attribs) {
          const lowerName = name.toLowerCase();

          // Handle special tags
          if (lowerName === 'title') {
            // will capture text in ontext
          } else if (lowerName === 'html' && attribs.lang) {
            lang = attribs.lang;
          } else if (lowerName === 'meta') {
            if (attribs.charset) charset = attribs.charset;
            if (attribs.name === 'viewport') viewport = attribs.content || viewport;
          }

          if (lowerName === 'style') {
            currentStyleTag = { text: '' };
            return;
          }

          if (lowerName === 'script') {
            const isImportMap = attribs.type === 'importmap';
            const isModule = attribs.type === 'module';
            currentScriptTag = {
              type: isImportMap ? 'importmap' : isModule ? 'module' : 'classic',
              src: attribs.src,
              text: '',
            };
            return;
          }

          // Build attributes map
          const compressedAttrs: Record<number, number> = {};
          for (const [key, val] of Object.entries(attribs)) {
            const keyIdx = attrNameDict.add(key);
            const valIdx = attrValDict.add(val);
            compressedAttrs[keyIdx] = valIdx;

            // Extra class token analysis
            if (key.toLowerCase() === 'class') {
              val.split(/\s+/).filter(Boolean).forEach((cls) => classTokenDict.add(cls));
            }
          }

          const tagIdx = tagDict.add(name);
          const newNode: HtmlAstNode = {
            t: tagIdx,
            type: 'element',
            a: Object.keys(compressedAttrs).length > 0 ? compressedAttrs : undefined,
            c: [],
          };

          const parent = nodeStack[nodeStack.length - 1];
          if (parent && parent.c) {
            parent.c.push(newNode);
          }
          nodeStack.push(newNode);
        },

        ontext(text) {
          if (currentStyleTag) {
            currentStyleTag.text += text;
            return;
          }
          if (currentScriptTag) {
            currentScriptTag.text += text;
            return;
          }

          // Title extraction
          const currentParent = nodeStack[nodeStack.length - 1];
          if (currentParent && tagDict.get(currentParent.t ?? -1)?.toLowerCase() === 'title') {
            title = text.trim();
          }

          const trimmed = text.replace(/[\t\r\n]+/g, ' ');
          if (trimmed.trim().length > 0) {
            if (currentParent && currentParent.c) {
              currentParent.c.push(trimmed);
            }
          }
        },

        onclosetag(name) {
          const lowerName = name.toLowerCase();

          if (lowerName === 'style') {
            if (currentStyleTag && currentStyleTag.text.trim()) {
              inlineStyles.push(currentStyleTag.text);
            }
            currentStyleTag = null;
            return;
          }

          if (lowerName === 'script') {
            if (currentScriptTag) {
              if (currentScriptTag.type === 'importmap') {
                if (currentScriptTag.text.trim()) {
                  importMaps.push(currentScriptTag.text);
                }
              } else {
                scriptCounter++;
                inlineScripts.push({
                  id: `script_${scriptCounter}`,
                  type: currentScriptTag.type,
                  content: currentScriptTag.text,
                  src: currentScriptTag.src,
                });
              }
            }
            currentScriptTag = null;
            return;
          }

          if (nodeStack.length > 1) {
            nodeStack.pop();
          }
        },

        oncomment(data) {
          const currentParent = nodeStack[nodeStack.length - 1];
          if (currentParent && currentParent.c && data.trim()) {
            currentParent.c.push({
              type: 'comment',
              txt: data.trim(),
            });
          }
        },
      },
      { decodeEntities: true, recognizeSelfClosing: true }
    );

    parser.write(rawHtml);
    parser.end();

    return {
      metadata: {
        title,
        charset,
        viewport,
        doctype,
        lang,
      },
      domTree: rootNode,
      inlineStyles,
      importMaps,
      inlineScripts,
      dictionaries: {
        tags: tagDict.toArray(),
        attrNames: attrNameDict.toArray(),
        attrValues: attrValDict.toArray(),
        classTokens: classTokenDict.toArray(),
      },
    };
  }

  /**
   * Reconstitute HTML string from crushed DOM tree and dictionaries
   */
  public rehydrate(
    node: HtmlAstNode,
    dictionaries: { tags: string[]; attrNames: string[]; attrValues: string[] },
    minified = false
  ): string {
    const indent = (depth: number) => (minified ? '' : '  '.repeat(depth));
    const nl = minified ? '' : '\n';

    const renderNode = (n: HtmlAstNode | string, depth: number): string => {
      if (typeof n === 'string') {
        return minified ? n : `${n}`;
      }

      if (n.type === 'comment') {
        return `<!--${n.txt}-->`;
      }

      const tagName = n.t !== undefined ? dictionaries.tags[n.t] : '';
      if (!tagName || tagName === 'root') {
        if (n.c) {
          return n.c.map((child) => renderNode(child, depth)).join(minified ? '' : nl);
        }
        return '';
      }

      // Format attributes
      let attrStr = '';
      if (n.a) {
        const parts: string[] = [];
        for (const [keyIdx, valIdx] of Object.entries(n.a)) {
          const key = dictionaries.attrNames[Number(keyIdx)];
          const val = dictionaries.attrValues[Number(valIdx)];
          if (key !== undefined) {
            parts.push(`${key}="${val.replace(/"/g, '&quot;')}"`);
          }
        }
        if (parts.length > 0) {
          attrStr = ' ' + parts.join(' ');
        }
      }

      const voidTags = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
      ]);

      if (voidTags.has(tagName.toLowerCase())) {
        return `${indent(depth)}<${tagName}${attrStr} />`;
      }

      const childrenStr = n.c
        ? n.c.map((child) => renderNode(child, depth + 1)).join(minified ? '' : nl)
        : '';

      const isInline = childrenStr.length < 40 && !childrenStr.includes('\n');
      if (isInline || minified) {
        return `<${tagName}${attrStr}>${childrenStr}</${tagName}>`;
      }

      return `${indent(depth)}<${tagName}${attrStr}>${nl}${childrenStr}${nl}${indent(depth)}</${tagName}>`;
    };

    return renderNode(node, 0);
  }
}
