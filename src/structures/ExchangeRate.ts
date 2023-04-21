import { ApiRate } from '../types/TipccApi';
import Amount from './Amount';

/**
 * A class for storing an API exchange rate for a cryptocurrency.
 */
export default class ExchangeRate {
  public code: string;

  public name: string;

  public usdValue?: Amount;

  /**
   * Create an ExchangeRate.
   * @param payload The rate from the API
   */
  constructor(payload: ApiRate) {
    this.code = payload.code;
    this.name = payload.name;
    if (payload.usd_value)
      this.usdValue = new Amount(payload.usd_value, 'fiat');
  }
}
