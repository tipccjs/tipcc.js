import BigNumber from 'bignumber.js';
import { CurrencyFormat } from './CurrencyFormatting';
import type {
  APICryptoCurrency,
  APIFiatCurrency,
} from '@tipccjs/tipcc-api-types';
import { ExchangeRate } from './ExchangeRate';

/**
 * A class for storing an API currency.
 *
 * @category Currency
 */
export class Currency {
  /** The currency code */
  public code: string;

  /** The currency name */
  public name: string;

  /** An instance of {@link CurrencyFormat} for this currency */
  public format: CurrencyFormat;

  constructor(payload: { code: string; name: string; format: CurrencyFormat }) {
    this.code = payload.code;
    this.name = payload.name;
    this.format = payload.format;
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

  /**
   * Convert the value in this currency to USD as a BigNumber.
   */
  public convertByExchangeRate(
    value: BigNumber,
    exchangeRate: ExchangeRate,
  ): BigNumber | null {
    if (!exchangeRate.usdValue?.value) return null;
    return this.convertFromRaw(value).times(exchangeRate.usdValue?.value);
  }
}

/**
 * A class for storing an API cryptocurrency.
 *
 * @category Currency
 */
export class CryptoCurrency extends Currency {
  /** The currency icon link */
  public icon: string;

  /** The currency explorer link */
  public explorer: string;

  /**
   * Create a CryptoCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APICryptoCurrency) {
    super({
      code: payload.code,
      name: payload.name,
      format: new CurrencyFormat(payload.format),
    });

    this.icon = payload.icon;
    this.explorer = payload.explorer;
  }
}

/**
 * A class for storing an API fiat currency.
 *
 * @category Currency
 */
export class FiatCurrency extends Currency {
  /**
   * Create a FiatCurrency.
   * @param payload The currency from the API
   */
  constructor(payload: APIFiatCurrency) {
    super({
      code: payload.code,
      name: payload.name,
      format: new CurrencyFormat(payload.format),
    });
  }
}
