import BigNumber from 'bignumber.js';
import type { APICoin, APIMonetary } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API amount. This can be used for either fiats or cryptocurrencies.
 *
 * @category Currency
 */
export class Amount {
  /** The raw API BigNumber */
  public valueRaw: BigNumber;

  /** The currency code */
  public currency: string;

  /**
   * Create an Amount.
   * @param payload An amount from the API
   */
  constructor(payload: APIMonetary | APICoin) {
    this.valueRaw = BigNumber(payload.value);
    this.currency = payload.currency;
  }
}
