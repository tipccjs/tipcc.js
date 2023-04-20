import { ApiRate } from '../types/TipccApi';
import Amount from './Amount';

export default class ExchangeRate {
  public code: string;

  public name: string;

  public usdValue?: Amount;

  constructor(payload: ApiRate) {
    this.code = payload.code;
    this.name = payload.name;
    if (payload.usd_value)
      this.usdValue = new Amount(payload.usd_value, 'fiat');
  }
}
