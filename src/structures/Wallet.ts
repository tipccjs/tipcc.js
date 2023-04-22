import { Amount } from './Amount';
import type { APIWallet } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API wallet.
 *
 * @category API Classes
 */
export class Wallet {
  /** The currency code */
  public code: string;

  /** The currency name */
  public name: string;

  /** The balance of this wallet */
  public balance: Amount;

  /** The USD value of this wallet's balance */
  public usdValue: Amount | null = null;

  /**
   * Create a Wallet.
   * @param payload The wallet from the API
   */
  constructor(payload: APIWallet) {
    this.code = payload.code;
    this.name = payload.name;
    this.balance = new Amount(payload.balance);
    this.usdValue = payload.usd_value ? new Amount(payload.usd_value) : null;
  }
}
