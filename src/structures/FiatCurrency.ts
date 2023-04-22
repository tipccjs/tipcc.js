import type { APIFiatCurrency } from '@tipccjs/tipcc-api-types';
import CurrencyFormat from './CurrencyFormat';

/**
 * A class for storing an API cryptocurrency.
 */
export default class FiatCurrency {
  public code: string;

  public name: string;

  public format: CurrencyFormat;

  /**
   * Create a CryptoCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APIFiatCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.format = new CurrencyFormat(payload.format);
  }
}
