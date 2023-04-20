import { ApiCurrencyFormat } from '../types/TipccApi';
import CryptoCurrencyUnit from './CryptoCurrencyFormatUnits';

export default class CryptoCurrencyFormat {
  public scale: number;

  public units: CryptoCurrencyUnit[];

  constructor(payload: ApiCurrencyFormat) {
    this.scale = payload.scale;
    this.units = payload.units.map((unit) => new CryptoCurrencyUnit(unit));
  }
}
