import type {
  APICryptoCurrencyUnit,
  APIFiatCurrencyUnit,
} from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API cryptocurrency unit.
 */
export default class CurrencyUnit {
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
