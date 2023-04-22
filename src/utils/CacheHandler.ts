import type {
  RESTGetAPICurrenciesCryptoCurrenciesResult,
  RESTGetAPICurrenciesFiatsResult,
} from '@tipccjs/tipcc-api-types';
import TipccClient from '../';
import CryptoCurrency from '../structures/CryptoCurrency';
import FiatCurrency from '../structures/FiatCurrency';

const cryptoCurrenciesCache: CryptoCurrency[] = [];
const fiatCurrenciesCache: FiatCurrency[] = [];

export const updateCurrenciesCache = async (
  client: TipccClient,
): Promise<void> => {
  const { cryptocurrencies } = (await client.REST.request(
    'GET',
    '/currencies/cryptocurrencies',
  )) as RESTGetAPICurrenciesCryptoCurrenciesResult;
  cryptoCurrenciesCache.splice(
    0,
    cryptoCurrenciesCache.length,
    ...cryptocurrencies.map((c) => new CryptoCurrency(c)),
  );
};
export const getCachedCryptoCurrency = (
  code: string,
): CryptoCurrency | undefined =>
  cryptoCurrenciesCache.find((c) => c.code === code);
export const getCachedCryptoCurrencies = (): CryptoCurrency[] =>
  cryptoCurrenciesCache;

export const updateFiatCurrenciesCache = async (
  client: TipccClient,
): Promise<void> => {
  const { fiats } = (await client.REST.request(
    'GET',
    '/currencies/fiats',
  )) as RESTGetAPICurrenciesFiatsResult;
  fiatCurrenciesCache.splice(
    0,
    fiatCurrenciesCache.length,
    ...fiats.map((c) => new FiatCurrency(c)),
  );
};
export const getCachedFiatCurrency = (code: string): FiatCurrency | undefined =>
  fiatCurrenciesCache.find((c) => c.code === code);
export const getCachedFiatCurrencies = (): FiatCurrency[] =>
  fiatCurrenciesCache;
