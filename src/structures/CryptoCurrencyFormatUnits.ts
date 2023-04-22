import { ApiCurrencyFormatUnit } from '../types/TipccApi';

/**
 * A class for storing an API cryptocurrency unit.
 */
export default class CryptoCurrencyUnit {
  public singular: string;

  public plural?: string;

  public prefix?: string;

  public suffix?: string;

  public scale: number;

  public aliases: string[];

  public minDecimals: number;

  public optionalDecimals: number;

  public min: number;

  /**
   * Create a CryptoCurrencyUnit.
   * @param payload The format unit from the API
   */
  constructor(payload: ApiCurrencyFormatUnit) {
    this.singular = payload.singular;
    this.plural = payload.plural ?? undefined;
    this.prefix = payload.prefix;
    this.suffix = payload.suffix;
    this.scale = payload.scale;
    this.aliases = payload.aliases ?? [];
    this.minDecimals = payload.minDecimals;
    this.optionalDecimals = payload.optionalDecimals;
    this.min = payload.min;
  }
}
