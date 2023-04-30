import { CryptoCurrency, ExchangeRate, FiatCurrency, TipccClient } from '..';
import {
  RESTGetAPICurrenciesCryptoCurrenciesResult,
  RESTGetAPICurrenciesFiatsResult,
  RESTGetAPICurrenciesRatesResult,
  Routes,
} from '@tipccjs/tipcc-api-types/v0';

/**
 * A class extending Array holding a cache of objects with type T.
 *
 * @category Client utilities
 * @typeParam T - The object type this {@link CurrencyCache} will hold
 */
export class CurrencyCache<T> extends Array {
  public client: TipccClient;

  /**
   * Create a CurrencyCache.
   * @param client The client which instantiated this CurrencyCache
   */
  constructor(client: TipccClient) {
    super();
    this.client = client;
  }

  /**
   * A shortcut to find a currency by code.
   * @param code The code to search for
   */
  public get(code: string): T | null {
    const found = this.find((i) => i.code === code);
    if (found) return found;
    return null;
  }
}

/**
 * A class extending {@link CurrencyCache} holding cryptocurrencies.
 *
 * @category Client utilities
 */
export class CryptocurrencyCache extends CurrencyCache<CryptoCurrency> {
  public async refresh(): Promise<CryptocurrencyCache> {
    const { cryptocurrencies } = (await this.client.REST.get(
      Routes.currenciesCryptocurrencies(),
    )) as RESTGetAPICurrenciesCryptoCurrenciesResult;

    this.splice(
      0,
      this.length,
      ...cryptocurrencies.map((c) => new CryptoCurrency(c)),
    );

    return this;
  }

  public async fetch(
    code: string,
    cache = true,
  ): Promise<CryptoCurrency | null> {
    if (cache && this.get(code)) return this.get(code);
    await this.refresh();
    return this.get(code);
  }
}

/**
 * A class extending {@link CurrencyCache} holding fiats.
 *
 * @category Client utilities
 */
export class FiatCache extends CurrencyCache<FiatCurrency> {
  public async refresh(): Promise<FiatCache> {
    const { fiats } = (await this.client.REST.get(
      Routes.currenciesFiats(),
    )) as RESTGetAPICurrenciesFiatsResult;

    this.splice(0, this.length, ...fiats.map((f) => new FiatCurrency(f)));

    return this;
  }

  public async fetch(code: string, cache = true): Promise<FiatCurrency | null> {
    if (cache && this.get(code)) return this.get(code);
    await this.refresh();
    return this.get(code);
  }
}

/**
 * A class extending {@link CurrencyCache} holding exchange rates.
 *
 * @category Client utilities
 */
export class ExchangeRateCache extends CurrencyCache<ExchangeRate> {
  public async refresh(): Promise<ExchangeRateCache> {
    const { rates } = (await this.client.REST.get(
      Routes.currenciesRates(),
    )) as RESTGetAPICurrenciesRatesResult;
    //return rates.map((r) => new ExchangeRate(r, this));

    this.splice(
      0,
      this.length,
      ...rates.map((r) => new ExchangeRate(r, this.client)),
    );

    return this;
  }
}
