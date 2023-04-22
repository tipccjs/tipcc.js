import BigNumber from 'bignumber.js';
import type { APICryptoCurrency } from '@tipccjs/tipcc-api-types';
import CryptoCurrencyFormat from './CurrencyFormat';

/**
 * A class for storing an API cryptocurrency.
 */
export default class CryptoCurrency {
  public code: string;

  public name: string;

  public icon: string;

  public explorer: string;

  public format: CryptoCurrencyFormat;

  /**
   * Create a CryptoCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APICryptoCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.icon = payload.icon;
    this.explorer = payload.explorer;
    this.format = new CryptoCurrencyFormat(payload.format);
  }

  /**
   * Convert a raw value to an amount.
   * @param value The raw value
   */
  public convertToAmount(value: BigNumber): BigNumber {
    return BigNumber(value).shiftedBy(this.format.scale * -1);
  }

  /**
   * Convert an amount to a raw value.
   * @param value The amount
   */
  public convertToRaw(value: BigNumber): BigNumber {
    return value.shiftedBy(this.format.scale);
  }
}
