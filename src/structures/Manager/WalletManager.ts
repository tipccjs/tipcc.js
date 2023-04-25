import { Wallet } from '../Wallet';
import { TipccClient } from '../TipccClient';
import { Cache } from '../Cache';
import {
  RESTGetAPIAccountWalletResult,
  RESTGetAPIAccountWalletsResult,
  Routes,
} from '@tipccjs/tipcc-api-types';

export class WalletManager {
  public client: TipccClient;

  public cache: Cache<Wallet>;

  public constructor(payload: { client: TipccClient; cacheTtl?: number }) {
    const { client, cacheTtl } = payload;
    this.client = client;
    this.cache = new Cache(cacheTtl);
  }

  public async fetch(
    currencyCode: string,
    cache = true,
  ): Promise<Wallet | null> {
    if (cache && this.cache.has(currencyCode))
      return this.cache.get(currencyCode)!;
    const wallet = (await this.client.REST.get(
      Routes.accountWallet(currencyCode),
    )) as RESTGetAPIAccountWalletResult;
    if (!wallet) return null;
    const w = new Wallet(wallet, this.client);
    if (w.currency) this.cache.set(w.currency.code, w);
    return w;
  }

  public async fetchMany(
    currencyCodes: string[],
    cache = true,
  ): Promise<Wallet[]> {
    const wallets = await Promise.all(
      currencyCodes.map((code) => this.fetch(code, cache)),
    );
    return wallets.filter((w): w is Wallet => w !== null) as Wallet[];
  }

  public async fetchAll(): Promise<Wallet[]> {
    const { wallets } = (await this.client.REST.get(
      Routes.accountWallets(),
    )) as RESTGetAPIAccountWalletsResult;
    if (!wallets) return [];
    const ws = wallets.map((wallet) => new Wallet(wallet, this.client));
    ws.forEach((w) => w.currency && this.cache.set(w.currency.code, w));
    return ws;
  }
}
