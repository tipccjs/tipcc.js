import type {
  APICryptoCurrency,
  APIFiatCurrency,
  APICryptoCurrencyUnit,
  APIFiatCurrencyUnit,
} from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API cryptocurrency unit.
 */
export class CurrencyUnit {
  public singular: string;

  public plural: string | null;

  public prefix: string | null;

  public suffix: string | null;

  public scale: number;

  public aliases: string[];

  public minDecimals: number | null;

  public optionalDecimals: boolean | null;

  public min: number | null;

  /**
   * Create a CryptoCurrencyUnit.
   * @param payload The format unit from the API
   */
  constructor(payload: APIFiatCurrencyUnit | APICryptoCurrencyUnit) {
    this.singular = payload.singular;
    this.plural = payload.plural ?? null;
    this.prefix = payload.prefix ?? null;
    this.suffix = payload.suffix ?? null;
    this.scale = payload.scale;
    this.aliases = payload.aliases ?? [];
    this.minDecimals = payload.minDecimals ?? null;
    this.optionalDecimals = payload.optionalDecimals ?? null;
    this.min = payload.min ?? null;
  }
}

/**
 * A class for storing an API cryptocurrency format.
 */
export class CurrencyFormat {
  public scale: number;

  public units: CurrencyUnit[];

  /**
   * Create a CryptoCurrencyFormat.
   * @param payload The format from the API
   */
  constructor(
    payload: APIFiatCurrency['format'] | APICryptoCurrency['format'],
  ) {
    this.scale = payload.scale;
    this.units = payload.units.map((unit) => new CurrencyUnit(unit));
  }
}
