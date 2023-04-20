import { ApiCurrency } from '../types/TipccApi';
import CryptoCurrencyFormat from './CryptoCurrencyFormat';

export default class CryptoCurrency {
  public code: string;

  public name: string;

  public icon: string;

  public explorer: string;

  public format: CryptoCurrencyFormat;

  constructor(payload: ApiCurrency) {
    this.code = payload.code;
    this.name = payload.name;
    this.icon = payload.icon;
    this.explorer = payload.explorer;
    this.format = new CryptoCurrencyFormat(payload.format);
  }
}
