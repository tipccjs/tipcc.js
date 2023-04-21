import { EventEmitter } from 'node:events';
import RequestHandler from './structures/RequestHandler';
import {
  APIRESTGetAccountTransactions,
  APIRESTGetCurrenciesRates,
  APIRESTGetTransaction,
  APIRESTGetWallets,
  APIRESTPostTipPayload,
  APIRESTPostTips,
  ApiTransaction,
  ApiWallet,
} from './types/TipccApi';
import Transaction from './structures/Transaction';
import {
  getCachedCryptoCurrencies,
  getCachedCryptoCurrency,
  updateFiatCurrenciesCache,
} from './utils/CacheHandler';
import { updateCurrenciesCache } from './utils/CacheHandler';
import CryptoCurrency from './structures/CryptoCurrency';
import ExchangeRate from './structures/ExchangeRate';
import Wallet from './structures/Wallet';
import { APIRESTGetWallet } from './types/TipccApi';

interface Events {
  tip: Transaction;
  ready: void;
}

export default class TipccClient extends EventEmitter {
  public token: string;

  public REST: RequestHandler;

  public isReady = false;

  public pollingInterval = 10000;

  public maxRetries = 5;

  private polling = new Set();

  private pollingTimeout: NodeJS.Timeout | null = null;

  private pollingRetries = 0;

  private lastPoll = new Date();

  /**
   * Create a tip.cc client.
   * @param token The tip.cc API token to use
   * @param options Optional options
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
      updateCurrenciesCache(this),
      updateFiatCurrenciesCache(this),
    ]).then(() => {
      this.emit('ready');
      this.isReady = true;
    });
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
          })) as APIRESTGetAccountTransactions
        ).transactions;

        break;
      } catch {
        this.pollingRetries += 1;

        if (this.pollingRetries >= this.maxRetries)
          throw new Error(
            `Failed ${this.pollingRetries} consecutive API polls. Is the API responding?`,
          );
      }
    } while(!transactions);

    // Reset pollingRetries, as it should only increment if multiple consecutive requests don't succeed
    if (this.pollingRetries > 0) this.pollingRetries = 0;

    for (const transaction of transactions) {
      if (!getCachedCryptoCurrency(transaction.amount.currency))
        await updateCurrenciesCache(this);
      this.emit(transaction.type, new Transaction(transaction));
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
   * Get a list of cryptocurrencies.
   * @param cache Whether to use the cache (`true` by default)
   */
  public async getCryptoCurrencies(cache = true): Promise<CryptoCurrency[]> {
    const currencies = getCachedCryptoCurrencies();
    if (currencies.length > 0 && cache) return currencies;
    await updateCurrenciesCache(this);
    return getCachedCryptoCurrencies();
  }

  /**
   * Get a list of fiat currencies.
   * @param cache Whether to use the cache (`true` by default)
   */
  public async getFiatCurrencies(cache = true): Promise<CryptoCurrency[]> {
    const currencies = getCachedCryptoCurrencies();
    if (currencies.length > 0 && cache) return currencies;
    await updateCurrenciesCache(this);
    return getCachedCryptoCurrencies();
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
      '/account/transactions',
      options,
    )) as APIRESTGetAccountTransactions;
    return transactions.map((t) => new Transaction(t));
  }

  /**
   * Get a list of exchange rates.
   */
  public async getExchangeRates(): Promise<ExchangeRate[]> {
    const { rates } = (await this.REST.request(
      'GET',
      '/exchange/rates',
    )) as APIRESTGetCurrenciesRates;
    return rates.map((r) => new ExchangeRate(r));
  }

  /**
   * Get a single transaction.
   * @param id The transaction id
   */
  public async getTransaction(id: string): Promise<Transaction | null> {
    const { transaction } = (await this.REST.request(
      'GET',
      `/account/transactions/${id}`,
    )) as APIRESTGetTransaction;
    if (!transaction) return null;
    return new Transaction(transaction);
  }

  /**
   * Post a new tip.
   * @param payload The post tip payload
   */
  public async postTip(
    payload: APIRESTPostTipPayload,
  ): Promise<APIRESTPostTips> {
    return (await this.REST.request(
      'POST',
      '/tips',
      payload,
    )) as APIRESTPostTips;
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
      `/account/wallets/${currency}`,
    )) as APIRESTGetWallet | null;
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
    );
  }

  /**
   * Get all wallets.
   */
  public async getWallets(): Promise<Wallet[]> {
    const { wallets } = (await this.REST.request(
      'GET',
      '/account/wallets',
    )) as APIRESTGetWallets;
    return wallets.map((w) => new Wallet(w));
  }
}
