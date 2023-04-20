import { EventEmitter } from 'node:events';
import RequestHandler from './functions/RequestHandler';
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
} from './functions/util/CacheHandler';
import { updateCurrenciesCache } from './functions/util/CacheHandler';
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

  private polling = new Set();

  private pollingTimeout: NodeJS.Timeout | null = null;

  private lastPoll = new Date();

  constructor(
    token: string,
    options: {
      baseUrl?: string;
      pollingInterval?: number;
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

    Promise.all([
      updateCurrenciesCache(this),
      updateFiatCurrenciesCache(this),
    ]).then(() => {
      this.emit('ready');
      this.isReady = true;
    });
  }

  private async _poll(): Promise<void> {
    const now = new Date();
    const { transactions } = (await this.REST.request(
      'GET',
      '/account/transactions',
      {
        types: [...this.polling],
        since: this.lastPoll.toISOString(),
        until: now.toISOString(),
      },
    )) as APIRESTGetAccountTransactions;

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

  public async getCryptoCurrencies(cache = true): Promise<CryptoCurrency[]> {
    const currencies = getCachedCryptoCurrencies();
    if (currencies.length > 0 && cache) return currencies;
    await updateCurrenciesCache(this);
    return getCachedCryptoCurrencies();
  }

  public async getFiatCurrencies(cache = true): Promise<CryptoCurrency[]> {
    const currencies = getCachedCryptoCurrencies();
    if (currencies.length > 0 && cache) return currencies;
    await updateCurrenciesCache(this);
    return getCachedCryptoCurrencies();
  }

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

  public async getExchangeRates(): Promise<ExchangeRate[]> {
    const { rates } = (await this.REST.request(
      'GET',
      '/exchange/rates',
    )) as APIRESTGetCurrenciesRates;
    return rates.map((r) => new ExchangeRate(r));
  }

  public async getTransaction(id: string): Promise<Transaction | null> {
    const { transaction } = (await this.REST.request(
      'GET',
      `/account/transactions/${id}`,
    )) as APIRESTGetTransaction;
    if (!transaction) return null;
    return new Transaction(transaction);
  }

  public async postTip(
    payload: APIRESTPostTipPayload,
  ): Promise<APIRESTPostTips> {
    return (await this.REST.request(
      'POST',
      '/tips',
      payload,
    )) as APIRESTPostTips;
  }

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

  public async getWallets(): Promise<Wallet[]> {
    const { wallets } = (await this.REST.request(
      'GET',
      '/account/wallets',
    )) as APIRESTGetWallets;
    return wallets.map((w) => new Wallet(w));
  }
}
