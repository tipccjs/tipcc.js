import BigNumber from 'bignumber.js';
import CryptoCurrency from './CryptoCurrency';
import { ApiAmount } from '../types/TipccApi';
import {
  getCachedCryptoCurrency,
  getCachedFiatCurrency,
} from '../utils/CacheHandler';

/**
 * A class for storing an API amount. This can be used for either fiats or cryptocurrencies.
 */
export default class Amount {
  public value: BigNumber;

  public currency?: CryptoCurrency;

  /**
   * Create an Amount.
   * @param payload An amount from the API
   * @param currencyType The type of currency
   */
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
