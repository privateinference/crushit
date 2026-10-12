/**
 * TokenDictionaryManager
 * Reusable Class-based token compressor and index resolver.
 */

export class TokenDictionaryManager {
  private tokens: string[] = [];
  private indices: Map<string, number> = new Map();

  constructor(initialTokens?: string[]) {
    if (initialTokens) {
      initialTokens.forEach((token) => this.add(token));
    }
  }

  /**
   * Add a token or return its existing index
   */
  public add(token: string): number {
    const existing = this.indices.get(token);
    if (existing !== undefined) {
      return existing;
    }
    const index = this.tokens.length;
    this.tokens.push(token);
    this.indices.set(token, index);
    return index;
  }

  /**
   * Get token by index
   */
  public get(index: number): string | undefined {
    return this.tokens[index];
  }

  /**
   * Check if token exists
   */
  public has(token: string): boolean {
    return this.indices.has(token);
  }

  /**
   * Get index of token
   */
  public indexOf(token: string): number {
    return this.indices.get(token) ?? -1;
  }

  /**
   * Export all unique tokens array
   */
  public toArray(): string[] {
    return [...this.tokens];
  }

  /**
   * Total token count
   */
  public size(): number {
    return this.tokens.length;
  }

  /**
   * Reset dictionary
   */
  public clear(): void {
    this.tokens = [];
    this.indices.clear();
  }
}
