import { ApiCurrencyFormatUnit } from '../types/TipccApi';

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
