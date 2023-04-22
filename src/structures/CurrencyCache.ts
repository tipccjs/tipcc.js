/**
 * A class extending Array holding a cache of objects with type T.
 *
 * @category Client utilities
 * @typeParam T - The object type this {@link CurrencyCache} will hold
 */
export class CurrencyCache<T> extends Array {
  private refreshFunction: () => T[] | Promise<T[]>;

  /**
   * Create a CurrencyCache.
   * @param refreshFunction The refresh function which returns new values to insert to this cache
   */
  constructor(refreshFunction: () => T[] | Promise<T[]>) {
    super();

    this.refreshFunction = refreshFunction;
  }

  /**
   * Refresh this CurrencyCache with new values received from refreshFunction.
   */
  public async refresh(): Promise<CurrencyCache<T>> {
    const refreshedData = await this.refreshFunction();
    this.splice(0, this.length, refreshedData);

    return this;
  }

  /**
   * A shortcut to find a currency by code.
   * @param code The code to search for
   */
  public async get(code: string): Promise<T | null> {
    const found = this.find((i) => i.code === code);
    if (found) return found;

    return null;
  }
}
