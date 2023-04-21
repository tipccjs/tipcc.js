import { ApiWallet } from '../types/TipccApi';
import Amount from './Amount';

/**
 * A class for storing an API wallet.
 */
export default class Wallet {
  public code: string;

  public name: string;

  public balance: Amount;

  public usdValue: Amount | null = null;

  /**
   * Create a Wallet.
   * @param payload The wallet from the API
   */
  constructor(payload: ApiWallet) {
    this.code = payload.code;
    this.name = payload.name;
    this.balance = new Amount(payload.balance);
    this.usdValue = payload.usd_value
      ? new Amount(payload.usd_value, 'fiat')
      : null;
  }
}
