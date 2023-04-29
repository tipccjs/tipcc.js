import { Amount } from './Amount';
import type { APIExchangeRate } from '@tipccjs/tipcc-api-types/v0';
import { TipccClient } from './TipccClient';

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

  /** The client that instantiated this */
  public client: TipccClient | undefined;

  /**
   * Create an ExchangeRate.
   * @param payload The rate from the API
   */
  constructor(payload: APIExchangeRate, client?: TipccClient) {
    if (client) this.client = client;
    this.code = payload.code;
    this.name = payload.name;
    if (payload.usd_value)
      this.usdValue = new Amount(payload.usd_value, this.client);
  }
}
