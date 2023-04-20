import BigNumber from 'bignumber.js';
import CryptoCurrency from './CryptoCurrency';
import { ApiAmount } from '../types/TipccApi';
import {
  getCachedCryptoCurrency,
  getCachedFiatCurrency,
} from '../functions/util/CacheHandler';

export default class Amount {
  public value: BigNumber;

  public currency?: CryptoCurrency;

  constructor(payload: ApiAmount, currencyType: 'fiat' | 'crypto' = 'crypto') {
    this.value = BigNumber(payload.value);
    switch (currencyType) {
      case 'crypto':
        this.currency = getCachedCryptoCurrency(payload.currency);
        break;
      case 'fiat':
        this.currency = getCachedFiatCurrency(payload.currency);
        break;
    }
  }

  get humanValue(): BigNumber {
    if (!this.currency) throw new Error('Currency is not defined');
    return this.value.shiftedBy(this.currency.format.scale * -1);
  }
}
