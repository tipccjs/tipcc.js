export default class CurrencyCache<T> extends Array {
  private refreshFunction: () => T[] | Promise<T[]>;

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
