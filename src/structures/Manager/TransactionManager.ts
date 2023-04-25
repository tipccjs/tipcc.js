import BigNumber from 'bignumber.js';
import { TipccClient } from '../TipccClient';
import {
  RESTGetAPIAccountTransactionResult,
  RESTGetAPIAccountTransactionsQuery,
  RESTGetAPIAccountTransactionsResult,
  RESTPostAPITipBody,
  RESTPostAPITipResult,
  Routes,
} from '@tipccjs/tipcc-api-types';
import { Transaction } from '../Transaction';
import { Cache } from '../Cache';
import { EventEmitter } from 'stream';

export interface RawValueTransaction {
  recipient_s: string | string[];
  value: string | number | BigNumber;
  currencyCode: string;
}

export interface ValueTransaction {
  recipient_s: string | string[];
  valueRaw: string | number | BigNumber;
  currencyCode: string;
}

export interface Events {
  tip: Transaction;
  withdrawal: Transaction;
  deposit: Transaction;
  ready: void;
}

export const isRawValueTransaction = (
  payload: any,
): payload is RawValueTransaction => payload && payload.valueRaw;
export const isValueTransaction = (payload: any): payload is ValueTransaction =>
  payload && payload.value;

export class TransactionManager extends EventEmitter {
  public client: TipccClient;

  public cache: Cache<Transaction>;

  private _pollingInterval = 5000;

  private _lastPoll: Date = new Date();

  private _pollingTimeout: NodeJS.Timeout | null = null;

  private _polling: Set<keyof Events> = new Set();

  private _maxPollingRetries = 5;

  private _pollingRetries = 0;

  public constructor(payload: {
    client: TipccClient;
    cacheTtl?: number;
    pollingInterval?: number;
    maxPollingRetries?: number;
  }) {
    const { client, cacheTtl, pollingInterval, maxPollingRetries } = payload;
    super();
    this.client = client;
    this.cache = new Cache(cacheTtl);

    if (pollingInterval) this._pollingInterval = pollingInterval;
    if (maxPollingRetries) this._maxPollingRetries = maxPollingRetries;
  }

  public async fetch(id: string, cache = true): Promise<Transaction | null> {
    if (cache && this.cache.has(id)) return this.cache.get(id)!;
    const { transaction } = (await this.client.REST.get(
      Routes.accountWalletTransaction(id),
    )) as RESTGetAPIAccountTransactionResult;
    if (!transaction) return null;
    const tx = new Transaction(transaction, this.client);
    this.cache.set(tx.id, tx);
    return tx;
  }

  public async fetchMany(ids: string[], cache = true): Promise<Transaction[]> {
    const txs = await Promise.all(ids.map((id) => this.fetch(id, cache)));
    return txs.filter((tx) => tx) as Transaction[];
  }

  public async fetchAll(filter: RESTGetAPIAccountTransactionsQuery = {}) {
    const { transactions } = (await this.client.REST.get(
      Routes.accountWalletTransactions(),
      filter,
    )) as RESTGetAPIAccountTransactionsResult;
    return transactions.map((t) => new Transaction(t, this.client));
  }

  public async create(
    payload: RawValueTransaction | ValueTransaction,
  ): Promise<Transaction[]> {
    const recipients = Array.isArray(payload.recipient_s)
      ? payload.recipient_s
      : [payload.recipient_s];
    const value = BigNumber(
      isRawValueTransaction(payload) ? payload.value : payload.valueRaw,
    ).toFixed(40);
    const currencyCode = payload.currencyCode;

    const tx = (await this.client.REST.post(Routes.tips(), {
      recipients: recipients,
      amount: {
        value,
        currency: currencyCode,
      },
      service: 'discord',
    } as RESTPostAPITipBody)) as RESTPostAPITipResult;

    if (!tx.tips.length) throw new Error('No tips were created.');

    return this.fetchMany(tx.tips.map((t) => t.id));
  }

  /* TRANSACTION POOLING */

  /**
   * Poll the tip.cc API for new data.
   */
  private async _poll(): Promise<void> {
    const now = new Date();

    let result: RESTGetAPIAccountTransactionsResult | null = null;
    const transactions: Map<string, Transaction> = new Map();

    do {
      try {
        result = (await this.client.REST.get(
          Routes.accountWalletTransactions(),
          {
            types: [...this._polling],
            since: this._lastPoll.toISOString(),
            until: now.toISOString(),
          },
        )) as RESTGetAPIAccountTransactionsResult;

        for (const tx of result.transactions)
          transactions.set(tx.id, new Transaction(tx, this.client));
      } catch (e) {
        this._pollingRetries++;

        if (this._pollingRetries >= this._maxPollingRetries)
          throw new Error(
            `Failed ${this._maxPollingRetries} consecutive API polls. Is the API responding?\n\n${e}`,
          );
      }
    } while (!result || result.more);

    // Reset pollingRetries, as it should only increment if multiple consecutive requests don't succeed
    if (this._pollingRetries > 0) this._pollingRetries = 0;

    let refreshedCurrencies = false;
    for (const transaction of transactions.values()) {
      if (
        !this.client.cryptos.get(transaction.amount.currencyCode) &&
        !refreshedCurrencies
      ) {
        await this.client.cryptos.refresh();
        refreshedCurrencies = true;
      }
      if (this.client.cryptos.get(transaction.amount.currencyCode))
        this.emit(transaction.type, transaction);
      else
        console.warn(
          `Unknown currency code ${transaction.amount.currencyCode} for transaction ${transaction.id} - Not emitting event.`,
        );
    }

    this._lastPoll = now;
    if (this._polling.size > 0)
      this._pollingTimeout = setTimeout(
        () => this._poll(),
        this._pollingInterval,
      );
  }

  private _stopPolling(): void {
    if (this._pollingTimeout) {
      clearTimeout(this._pollingTimeout);
      this._pollingTimeout = null;
    }
  }

  public on<K extends keyof Events>(s: K, f: (arg: Events[K]) => void): this {
    super.on(s, f);
    this._polling.add(s);
    if (this._polling.size === 1 && !this._pollingTimeout) this._poll();
    return this;
  }

  public off<K extends keyof Events>(s: K, f: (arg: Events[K]) => void): this {
    super.off(s, f);
    this._polling.delete(s);
    if (this._polling.size === 0 && this._pollingTimeout) this._stopPolling();
    return this;
  }
}
