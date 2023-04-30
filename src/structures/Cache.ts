/**
 * A class extending Array holding a cache of objects with type T.
 *
 * @category Client utilities
 * @typeParam T - The object type this {@link Cache} will hold
 */
export class Cache<T> extends Map<string, T> {
  /** The duration in ms before items in this cache are considered stale (Default: 24h) */
  public cacheTtl: number = 24 * 60 * 60 * 1000;

  private _timeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a Cache.
   * @param cacheTtl The duration in ms before items in this cache are considered stale (Default: 24h)
   */
  constructor(cacheTtl?: number) {
    super();
    if (cacheTtl) this.cacheTtl = cacheTtl;
  }

  public set(key: string, value: T): this {
    if (this._timeouts.has(key)) clearTimeout(this._timeouts.get(key));
    super.set(key, value);
    this._timeouts.set(
      key,
      setTimeout(() => super.delete(key)),
    );
    return this;
  }

  public setMany(...[key, value]: [string, T]): this {
    if (this._timeouts.has(key)) clearTimeout(this._timeouts.get(key));
    this.set(key, value);
    this._timeouts.set(
      key,
      setTimeout(() => this.delete(key)),
    );
    return this;
  }

  public delete(key: string) {
    if (this._timeouts.has(key)) clearTimeout(this._timeouts.get(key));
    return super.delete(key);
  }

  public deleteMany(...keys: string[]) {
    for (const key of keys) this.delete(key);
    return this;
  }

  public clear() {
    for (const timeout of this._timeouts.values()) clearTimeout(timeout);
    super.clear();
    return this;
  }
}
