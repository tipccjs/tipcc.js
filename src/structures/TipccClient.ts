import { EventEmitter } from 'node:events';
import { RequestHandler } from './RequestHandler';
import { CurrencyCache } from './CurrencyCache';
import { CryptoCurrency, FiatCurrency } from './Currency';
import { ExchangeRate } from './ExchangeRate';

import {
  RESTGetAPICurrenciesCryptoCurrenciesResult,
  RESTGetAPICurrenciesFiatsResult,
  RESTGetAPICurrenciesRatesResult,
  Routes,
} from '@tipccjs/tipcc-api-types';
import { WalletManager } from './Manager/WalletManager';
import { TransactionManager } from './Manager/TransactionManager';

interface Emoji {
  name: string;
  id: string;
}

/**
 * A tip.cc client to interact with the API.
 *
 * @category Client
 */
export class TipccClient extends EventEmitter {
  /** The tip.cc API token this client uses */
  public token: string;

  /** The {@link RequestHandler} this client uses */
  public REST: RequestHandler;

  /** The {@link WalletManager} for this client */
  public wallets: WalletManager;

  /** The {@link TransactionManager} for this client */
  public transactions: TransactionManager;

  /** The {@link CurrencyCache} for cryptocurrencies */
  public cryptos: CurrencyCache<CryptoCurrency>;

  /** The {@link CurrencyCache} for fiat currencies */
  public fiats: CurrencyCache<FiatCurrency>;

  /** The {@link CurrencyCache} for exchange rates */
  public exchangeRates: CurrencyCache<ExchangeRate>;

  /** A boolean indicating whether the client is ready */
  public isReady = false;

  /** The number of milliseconds between each API poll  */
  public pollingInterval = 10000;

  /** The max number of retries to poll the API, after which an error will be thrown */
  public maxRetries = 5;

  /** The number of milliseconds between each exchange rate refresh (0 = no automatic refresh) */
  public exchangeRateRefreshInterval = 60 * 1000;

  private _emojis: Map<string, string> = new Map();

  /**
   * Create a tip.cc client.
   * @param token The tip.cc API token to use
   * @param options The options to use
   * @param options.baseUrl The base URL for requests
   * @param options.pollingInterval The number of milliseconds between each API poll. Defaults to `10000`.
   * @param options.maxRetries The max number of retries to poll the API, after which an error will be thrown. Defaults to `5`.
   */
  constructor(
    token: string,
    options: {
      baseUrl?: string;
      pollingInterval?: number;
      maxRetries?: number;
    } = {},
  ) {
    super();

    if (!/(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/.test(token))
      throw new Error('Invalid token provided');

    this.wallets = new WalletManager({
      client: this,
    });
    this.transactions = new TransactionManager({
      client: this,
    });
    this.cryptos = new CurrencyCache(this._refreshCryptos);
    this.fiats = new CurrencyCache(this._refreshFiats);
    this.exchangeRates = new CurrencyCache(this._refreshExchangeRates);

    this.token = token;
    this.REST = new RequestHandler(token, {
      apiBaseUrl: options.baseUrl,
    });

    if (options.pollingInterval) this.pollingInterval = options.pollingInterval;
    if (options.maxRetries) this.maxRetries = options.maxRetries;

    this._init();
  }

  public async _init(): Promise<void> {
    await this.cryptos.refresh();
    await this.fiats.refresh();
    await this.exchangeRates.refresh();

    if (this.exchangeRateRefreshInterval > 0) {
      setInterval(
        () => this.exchangeRates.refresh(),
        this.exchangeRateRefreshInterval,
      );
    }

    this.emit('ready');
    this.isReady = true;
  }

  /** A map for emojis which should be used for formatted amounts */
  public get emojis(): Emoji[] {
    return [...this._emojis].map(([name, id]) => ({ name, id }));
  }

  /** A map for emojis which should be used for formatted amounts */
  public set emojis(emojis: Emoji[]) {
    this._emojis = new Map(emojis.map(({ name, id }) => [name, id]));
  }

  private async _refreshCryptos(): Promise<CryptoCurrency[]> {
    const { cryptocurrencies } = (await this.REST.request(
      'GET',
      Routes.currenciesCryptocurrencies(),
    )) as RESTGetAPICurrenciesCryptoCurrenciesResult;

    return cryptocurrencies.map((c) => new CryptoCurrency(c));
  }

  private async _refreshFiats(): Promise<FiatCurrency[]> {
    const { fiats } = (await this.REST.request(
      'GET',
      Routes.currenciesFiats(),
    )) as RESTGetAPICurrenciesFiatsResult;

    return fiats.map((c) => new FiatCurrency(c));
  }

  private async _refreshExchangeRates(): Promise<ExchangeRate[]> {
    const { rates } = (await this.REST.request(
      'GET',
      Routes.currenciesRates(),
    )) as RESTGetAPICurrenciesRatesResult;
    return rates.map((r) => new ExchangeRate(r, this));
  }
}
