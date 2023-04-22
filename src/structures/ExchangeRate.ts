import { Amount } from './Amount';
import type { APIExchangeRate } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API exchange rate for a cryptocurrency.
 *
 * @category API Classes
 */
export class ExchangeRate {
  /** The currency code */
  public code: string;

  /** The currency name */
  public name: string;

  /** The USD value of {@link ExchangeRate.code currency} */
  public usdValue?: Amount;

  /**
   * Create an ExchangeRate.
   * @param payload The rate from the API
   */
  constructor(payload: APIExchangeRate) {
    this.code = payload.code;
    this.name = payload.name;
    if (payload.usd_value) this.usdValue = new Amount(payload.usd_value);
  }
}
