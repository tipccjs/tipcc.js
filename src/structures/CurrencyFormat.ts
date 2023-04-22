import type {
  APICryptoCurrency,
  APIFiatCurrency,
} from '@tipccjs/tipcc-api-types';
import CryptoCurrencyUnit from './CurrencyFormatUnits';

/**
 * A class for storing an API cryptocurrency format.
 */
export default class CurrencyFormat {
  public scale: number;

  public units: CryptoCurrencyUnit[];

  /**
   * Create a CryptoCurrencyFormat.
   * @param payload The format from the API
   */
  constructor(
    payload: APIFiatCurrency['format'] | APICryptoCurrency['format'],
  ) {
    this.scale = payload.scale;
    this.units = payload.units.map((unit) => new CryptoCurrencyUnit(unit));
  }
}
