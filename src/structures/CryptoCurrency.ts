import { ApiCurrency } from '../types/TipccApi';
import CryptoCurrencyFormat from './CryptoCurrencyFormat';

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
  constructor(payload: ApiCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.icon = payload.icon;
    this.explorer = payload.explorer;
    this.format = new CryptoCurrencyFormat(payload.format);
  }
}
