import { EventEmitter } from 'node:events';
import { RequestHandler } from './RequestHandler';
import { Transaction } from './Transaction';
import { CurrencyCache } from './CurrencyCache';
import { CryptoCurrency, FiatCurrency } from './Currency';
import { ExchangeRate } from './ExchangeRate';
import { Wallet } from './Wallet';
import {
  RESTGetAPICurrenciesCryptoCurrenciesResult,
  RESTGetAPICurrenciesFiatsResult,
  RESTGetAPIAccountTransactionResult,
  RESTGetAPIAccountTransactionsResult,
  RESTGetAPIAccountWalletResult,
  RESTGetAPIAccountWalletsResult,
  RESTGetAPICurrenciesRatesResult,
  RESTPostAPITipBody,
  RESTPostAPITipResult,
  Routes,
} from '@tipccjs/tipcc-api-types';

interface Events {
  tip: Transaction;
  ready: void;
}

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

  /** The {@link CurrencyCache} for cryptocurrencies */
  public cryptos = new CurrencyCache<CryptoCurrency>(this._refreshCryptos);

  /** The {@link CurrencyCache} for fiat currencies */
  public fiats = new CurrencyCache<FiatCurrency>(this._refreshFiats);

  /** The {@link CurrencyCache} for exchange rates */
  public exchangeRates = new CurrencyCache<ExchangeRate>(
    this._refreshExchangeRates,
  );

  /** A boolean indicating whether the client is ready */
  public isReady = false;

  /** The number of milliseconds between each API poll  */
  public pollingInterval = 10000;

  /** The max number of retries to poll the API, after which an error will be thrown */
  public maxRetries = 5;

  /** The number of milliseconds between each exchange rate refresh (0 = no automatic refresh) */
  public exchangeRateRefreshInterval = 60 * 1000;

  private _emojis: Map<string, string> = new Map();

  private polling = new Set();

  private pollingTimeout: NodeJS.Timeout | null = null;

  private pollingRetries = 0;

  private lastPoll = new Date();

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

    this.token = token;
    this.REST = new RequestHandler(token, {
      apiBaseUrl: options.baseUrl,
    });

    if (options.pollingInterval) this.pollingInterval = options.pollingInterval;
    if (options.maxRetries) this.maxRetries = options.maxRetries;

    Promise.all([
      this.cryptos.refresh(),
      this.fiats.refresh(),
      this.exchangeRates.refresh(),
    ]).then(() => {
      if (this.exchangeRateRefreshInterval > 0)
        setInterval(
          () => this.exchangeRates.refresh(),
          this.exchangeRateRefreshInterval,
        );
      this.emit('ready');
      this.isReady = true;
    });
  }

  /** A map for emojis which should be used for formatted amounts */
  public get emojis(): Emoji[] {
    return [...this._emojis].map(([name, id]) => ({ name, id }));
  }

  /** A map for emojis which should be used for formatted amounts */
  public set emojis(emojis: Emoji[]) {
    this._emojis = new Map(emojis.map(({ name, id }) => [name, id]));
  }

  /**
   * Poll the tip.cc API for new data.
   */
  private async _poll(): Promise<void> {
    const now = new Date();
    let transactions;

    // Retry until a successful reponse is received or max retries are reached
    do {
      try {
        transactions = (
          (await this.REST.request('GET', '/account/transactions', {
            types: [...this.polling],
            since: this.lastPoll.toISOString(),
            until: now.toISOString(),
          })) as RESTGetAPIAccountTransactionsResult
        ).transactions;

        break;
      } catch {
        this.pollingRetries += 1;

        if (this.pollingRetries >= this.maxRetries)
          throw new Error(
            `Failed ${this.pollingRetries} consecutive API polls. Is the API responding?`,
          );
      }
    } while (!transactions);

    // Reset pollingRetries, as it should only increment if multiple consecutive requests don't succeed
    if (this.pollingRetries > 0) this.pollingRetries = 0;

    for (const transaction of transactions) {
      if (!this.cryptos.get(transaction.amount.currency))
        await this.cryptos.refresh();
      this.emit(transaction.type, new Transaction(transaction, this));
    }

    this.lastPoll = now;
    if (this.polling.size > 0)
      this.pollingTimeout = setTimeout(
        () => this._poll(),
        this.pollingInterval,
      );
  }

  private _stopPolling(): void {
    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
      this.pollingTimeout = null;
    }
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

  public on<K extends keyof Events>(s: K, f: (arg: Events[K]) => void): this {
    super.on(s, f);
    this.polling.add(s);
    if (this.polling.size === 1 && !this.pollingTimeout) this._poll();
    return this;
  }

  public off<K extends keyof Events>(s: K, f: (arg: Events[K]) => void): this {
    super.off(s, f);
    this.polling.delete(s);
    if (this.polling.size === 0 && this.pollingTimeout) this._stopPolling();
    return this;
  }

  /**
   * Get a list of transactions based on options.
   * @param options Which options to use when requesting transactions
   */
  public async getTransactions(
    options: {
      types?: string[];
      since?: Date;
      until?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Transaction[]> {
    const { transactions } = (await this.REST.request(
      'GET',
      Routes.accountWalletTransactions(),
      options,
    )) as RESTGetAPIAccountTransactionsResult;
    return transactions.map((t) => new Transaction(t, this));
  }

  /**
   * Get a list of exchange rates.
   */
  public async getExchangeRates(): Promise<ExchangeRate[]> {
    const { rates } = (await this.REST.request(
      'GET',
      Routes.currenciesRates(),
    )) as RESTGetAPICurrenciesRatesResult;
    return rates.map((r) => new ExchangeRate(r, this));
  }

  /**
   * Get a single transaction.
   * @param id The transaction id
   */
  public async getTransaction(id: string): Promise<Transaction | null> {
    const { transaction } = (await this.REST.request(
      'GET',
      Routes.accountWalletTransaction(id),
    )) as RESTGetAPIAccountTransactionResult;
    if (!transaction) return null;
    return new Transaction(transaction, this);
  }

  /**
   * Post a new tip.
   * @param payload The post tip payload
   */
  public async postTip(
    payload: RESTPostAPITipBody,
  ): Promise<RESTPostAPITipResult> {
    return (await this.REST.request(
      'POST',
      '/tips',
      payload,
    )) as RESTPostAPITipResult;
  }

  /**
   * Get a single wallet.
   * @param currency The wallet currency
   * @param fallback Whether to create an empty wallet if there's no API response
   */
  public async getWallet(
    currency: string,
    fallback = true,
  ): Promise<Wallet | null> {
    const result = (await this.REST.request(
      'GET',
      Routes.accountWallet(currency),
    )) as RESTGetAPIAccountWalletResult | null;
    if (!result && !fallback) return null;
    return new Wallet(
      result ?? {
        code: currency,
        name: currency,
        usd_value: {
          value: '0',
          currency: 'USD',
        },
        balance: {
          value: '0',
          currency,
        },
      },
      this,
    );
  }

  /**
   * Get all wallets.
   */
  public async getWallets(): Promise<Wallet[]> {
    const { wallets } = (await this.REST.request(
      'GET',
      Routes.accountWallets(),
    )) as RESTGetAPIAccountWalletsResult;
    return wallets.map((w) => new Wallet(w, this));
  }
}
