import BigNumber from 'bignumber.js';
import type {
  APICryptoCurrency,
  APIFiatCurrency,
} from '@tipccjs/tipcc-api-types';
import { CurrencyFormat } from './CurrencyFormatting';

/**
 * A class for storing an API cryptocurrency.
 */
export class CryptoCurrency {
  public code: string;

  public name: string;

  public icon: string;

  public explorer: string;

  public format: CurrencyFormat;

  /**
   * Create a CryptoCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APICryptoCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.icon = payload.icon;
    this.explorer = payload.explorer;
    this.format = new CurrencyFormat(payload.format);
  }

  /**
   * Convert a raw value to a BigNumber in human readable format.
   * @param value The raw value
   */
  public convertFromRaw(value: BigNumber): BigNumber {
    return BigNumber(value).shiftedBy(this.format.scale * -1);
  }

  /**
   * Convert a BigNumber value in human readable format to a raw API BigNumber.
   * @param value The amount
   */
  public convertToRaw(value: BigNumber): BigNumber {
    return value.shiftedBy(this.format.scale);
  }
}

/**
 * A class for storing an API fiat currency.
 */
export class FiatCurrency {
  public code: string;

  public name: string;

  public format: CurrencyFormat;

  /**
   * Create a FiatCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APIFiatCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.format = new CurrencyFormat(payload.format);
  }

  /**
   * Convert a raw value to a BigNumber in human readable format.
   * @param value The raw value
   */
  public convertFromRaw(value: BigNumber): BigNumber {
    return BigNumber(value).shiftedBy(this.format.scale * -1);
  }

  /**
   * Convert a BigNumber value in human readable format to a raw API BigNumber.
   * @param value The amount
   */
  public convertToRaw(value: BigNumber): BigNumber {
    return value.shiftedBy(this.format.scale);
  }
}
