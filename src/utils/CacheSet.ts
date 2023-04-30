export class CacheSet<T> extends Set {
  private _cacheTtl: number;

  private _timeouts: Map<T, NodeJS.Timeout> = new Map();

  constructor(cacheTtl: number) {
    super();
    this._cacheTtl = cacheTtl;
  }

  public add(value: T): this {
    super.add(value);
    if (this._timeouts.has(value)) clearTimeout(this._timeouts.get(value)!);
    this._timeouts.set(
      value,
      setTimeout(() => this.delete(value), this._cacheTtl),
    );
    return this;
  }

  public delete(value: T): boolean {
    if (this._timeouts.has(value)) clearTimeout(this._timeouts.get(value)!);
    return super.delete(value);
  }

  public clear(): void {
    for (const timeout of this._timeouts.values()) clearTimeout(timeout);
    super.clear();
  }
}
