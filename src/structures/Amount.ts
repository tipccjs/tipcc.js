import BigNumber from 'bignumber.js';
import type { APICoin, APIMonetary } from '@tipccjs/tipcc-api-types';
import { TipccClient } from './TipccClient';
import { CryptoCurrency, FiatCurrency } from './Currency';

/**
 * A class for storing an API amount. This can be used for either fiats or cryptocurrencies.
 *
 * @category Currency
 */
export class Amount {
  /** The raw API BigNumber */
  public valueRaw: BigNumber;

  /** The value */
  public get value(): BigNumber | null {
    const currency = this.currency;
    if (!currency) return null;
    return currency.convertFromRaw(this.valueRaw);
  }

  /** The currency code */
  public currencyCode: string;

  /** The currency */
  public get currency(): (FiatCurrency | CryptoCurrency) | null {
    if (!this.client) return null;
    const currency =
      this.client.cryptos.get(this.currencyCode) ??
      this.client.fiats.get(this.currencyCode);
    if (!currency) return null;
    return currency;
  }

  /** The USD value */
  public get usdValue(): BigNumber | null {
    if (!this.currency) return null;
    const exchangeRate =
      this.client?.exchangeRates.get(this.currency.code) ?? null;
    if (!exchangeRate) return null;
    if (!this.value) return null;
    return this.currency.convertByExchangeRate(this.value, exchangeRate);
  }

  /** The currency emoji (Discord Formatted) */
  public get emoji(): string | null {
    if (!this.client) return null;
    const currencyEmoji = this.client.emojis.find(
      (e) => e.name.toUpperCase() === this.currencyCode.toUpperCase(),
    );
    if (!currencyEmoji) return null;
    return `<:${currencyEmoji.name}:${currencyEmoji.id}>`;
  }

  /** The client that instantiated this */
  public client: TipccClient | null = null;

  /**
   * Create an Amount.
   * @param payload An amount from the API
   */
  constructor(payload: APIMonetary | APICoin, client?: TipccClient) {
    this.valueRaw = BigNumber(payload.value);
    this.currencyCode = payload.currency;
    if (client) this.client = client;
  }

  public toString(includeUsd = true): string | null {
    const emoji = this.emoji;
    const value = this.valueRaw;
    const currency = this.currency;

    if (!value || !currency) return null;

    const unit =
      currency.format.units
        .filter((u) => u.min)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .find((u) => BigNumber(u.min!).lte(this.valueRaw)) ??
      currency.format.units[0];

    return `${emoji ? `${emoji} ` : ''} ${this.valueRaw
      .shiftedBy(-unit.scale)
      .toFixed(unit.optionalDecimals ?? unit.scale)
      .replace(/\.?0+$/, '')} ${unit.singular} ${includeUsd ? 'USD' : ''}`;
  }
}
