import Amount from '../structures/Amount';

export interface ApiUser {
  identifier: string;
  username: string;
  avatar_url: string;
  service: 'discord';
}

export interface ApiAmount {
  value: string;
  currency: string;
}

export interface ApiTip {
  id: string;
  recipient: ApiUser;
  amount: ApiAmount;
}

export interface ApiWallet {
  code: string;
  name: string;
  balance: ApiAmount;
  usd_value: ApiAmount | null;
}

export interface ApiTransaction {
  id: string;
  type: 'tip' | 'withdrawal' | 'deposit';
  amount: ApiAmount;
  fee: ApiAmount | null;
  usdValue: ApiAmount | null;
  service: 'discord';
  chat_id: string;
  subchat_id: string;
  sender: ApiUser;
  recipient: ApiUser;
  created: string;
}

export interface ApiCurrencyFormatUnit {
  singular: string;
  plural?: string;
  prefix?: string;
  suffix?: string;
  scale: number;
  aliases?: string[];
  minDecimals: number;
  optionalDecimals: number;
  min: number;
}

export interface ApiCurrencyFormat {
  scale: number;
  units: ApiCurrencyFormatUnit[];
  code: string;
}

export interface ApiCurrency {
  code: string;
  name: string;
  color: string;
  icon: string;
  explorer: string;
  format: ApiCurrencyFormat;
}

export interface ApiRate {
  code: string;
  name: string;
  usd_value: ApiAmount;
}

export type APIRESTGetAccountTransactions = {
  transactions: ApiTransaction[];
};

export type APIRESTGetCurrenciesCryptocurrencies = {
  cryptocurrencies: ApiCurrency[];
};

export type APIRESTGetCurrentciesFiats = {
  fiats: ApiCurrency[];
};

export type APIRESTGetCurrenciesRates = {
  rates: ApiRate[];
};

export type APIRESTPostTips = {
  tips: ApiTip[];
  total: ApiAmount;
};

export type APIRESTGetTransaction = {
  transaction: ApiTransaction;
};

export type APIRESTPostTipPayload = {
  service?: 'discord';
  recipient: string;
  amount: ApiAmount | Amount;
};

export type APIRESTGetWallets = {
  wallets: ApiWallet[];
};

export type APIRESTGetWallet = ApiWallet;
