import TipccClient from '../';
import CryptoCurrency from '../structures/CryptoCurrency';
import {
  APIRESTGetCurrenciesCryptocurrencies,
  APIRESTGetCurrentciesFiats,
} from '../types/TipccApi';

const cryptoCurrenciesCache: CryptoCurrency[] = [];
const fiatCurrenciesCache: CryptoCurrency[] = [];

export const updateCurrenciesCache = async (
  client: TipccClient,
): Promise<void> => {
  const { cryptocurrencies } = (await client.REST.request(
    'GET',
    '/currencies/cryptocurrencies',
  )) as APIRESTGetCurrenciesCryptocurrencies;
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
  )) as APIRESTGetCurrentciesFiats;
  fiatCurrenciesCache.splice(
    0,
    fiatCurrenciesCache.length,
    ...fiats.map((c) => new CryptoCurrency(c)),
  );
};
export const getCachedFiatCurrency = (
  code: string,
): CryptoCurrency | undefined =>
  fiatCurrenciesCache.find((c) => c.code === code);
export const getCachedFiatCurrencies = (): CryptoCurrency[] =>
  fiatCurrenciesCache;
