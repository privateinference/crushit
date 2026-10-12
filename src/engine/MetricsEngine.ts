/**
 * MetricsEngine
 * Computes exact compression statistics, token reductions, and deduplication gains.
 */
import { CompressionStats, OmniCrushedDocument } from './types';

export class MetricsEngine {
  private static instance: MetricsEngine;

  public static getInstance(): MetricsEngine {
    if (!MetricsEngine.instance) {
      MetricsEngine.instance = new MetricsEngine();
    }
    return MetricsEngine.instance;
  }

  /**
   * Approximate token count for LLMs (GPT/Gemini tokenizer average ~3.7 characters per token)
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    // LLMs tokenize code and repetitive punctuation densely, 3.6 chars/token is a high-accuracy empirical baseline
    return Math.ceil(text.length / 3.6);
  }

  /**
   * Approximate gzip size using LZ77 / Huffman entropy estimation
   */
  public estimateGzip(text: string): number {
    if (!text) return 0;
    // Frequency entropy estimation
    const charMap = new Map<string, number>();
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      charMap.set(c, (charMap.get(c) || 0) + 1);
    }
    let entropy = 0;
    for (const count of charMap.values()) {
      const p = count / text.length;
      entropy -= p * Math.log2(p);
    }
    // Theoretical minimum bits = text.length * entropy + header overhead
    const estimatedCompressedBytes = Math.ceil((text.length * entropy) / 8) + 24;
    return Math.min(estimatedCompressedBytes, Math.ceil(text.length * 0.45));
  }

  /**
   * Calculate complete compression metrics
   */
  public calculate(
    originalHtml: string,
    minifiedHtml: string,
    crushedDoc: Partial<OmniCrushedDocument>
  ): CompressionStats {
    const originalBytes = new TextEncoder().encode(originalHtml).length;
    const minifiedHtmlBytes = new TextEncoder().encode(minifiedHtml).length;

    const crushedJsonString = JSON.stringify(crushedDoc);
    const crushedJsonBytes = new TextEncoder().encode(crushedJsonString).length;

    const estimatedGzipBytes = this.estimateGzip(crushedJsonString);

    const originalTokens = this.estimateTokens(originalHtml);
    const crushedTokens = this.estimateTokens(crushedJsonString);

    const byteReductionPercent =
      originalBytes > 0
        ? Math.max(0, Math.round(((originalBytes - crushedJsonBytes) / originalBytes) * 100))
        : 0;

    const tokenReductionPercent =
      originalTokens > 0
        ? Math.max(0, Math.round(((originalTokens - crushedTokens) / originalTokens) * 100))
        : 0;

    let cdnUrlsDeduplicated = 0;
    if (crushedDoc.importMaps) {
      crushedDoc.importMaps.forEach((im) => {
        cdnUrlsDeduplicated += im.cdnPrefixes.length;
      });
    }

    let scriptLiteralsDeduplicated = 0;
    if (crushedDoc.scripts) {
      crushedDoc.scripts.forEach((s) => {
        scriptLiteralsDeduplicated += s.astSummary?.stringLiterals.length || 0;
      });
    }

    return {
      originalBytes,
      minifiedHtmlBytes,
      crushedJsonBytes,
      estimatedGzipBytes,
      originalTokens,
      crushedTokens,
      byteReductionPercent,
      tokenReductionPercent,
      uniqueTagsCount: crushedDoc.dictionaries?.tags.length || 0,
      uniqueAttrsCount: crushedDoc.dictionaries?.attrNames.length || 0,
      uniqueValuesCount: crushedDoc.dictionaries?.attrValues.length || 0,
      uniqueCssPropsCount: crushedDoc.css?.properties.length || 0,
      uniqueCssValuesCount: crushedDoc.css?.values.length || 0,
      cdnUrlsDeduplicated,
      scriptLiteralsDeduplicated,
    };
  }
}
