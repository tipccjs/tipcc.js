# tip.cc API Client

Welcome to the tip.cc API Client npm package!

## Installation

Simply create an npm project if you don't have an already, and install the package.

```
npm init
npm i tipcc.js
```

## Getting Started

> Tip: Want to get started without an introduction? Check out our [documentation](https://tipccjs.org/).

You can create a simple TipccClient like this:

```js
import { TipccClient } from 'tipcc.js';

const client = TipccClient(myToken);

client.on('ready', () => {
  console.log('TipccClient is ready!');
});
```

`myToken` is your tip.cc API key.

## A note on API values

The tip.cc API uses the smallest denomination of currencies, giving values in atomic units.
For an explanation of how this works, use [Ethereum's wei](https://www.investopedia.com/terms/w/wei.asp) as an example.

tipcc.js uses the bignumber.js package to handle these numbers, and our API will return these in multiple functions.

For a in-depth explanation of BigNumbers and available features, check their own [documentation](https://mikemcl.github.io/bignumber.js/).

## Wallets

To get your balance on tip.cc, use the [WalletManager](https://tipccjs.org/classes/WalletManager):

```js
client.on('ready', async () => {
  const wallet = await client.wallets.fetch('BNB');
  if (!wallet) {
    return console.log('No BNB wallet found. Have you received any BNB?');
  }

  console.log(
    `We've got ${wallet.balance.value} ${wallet.code} on our BNB wallet`,
  );

  console.log(`This is approximately ${wallet.balance.usdValue} USD`);
});
```

## Transactions

### Events

To receive transactions as events, use [TransactionManager](https://tipccjs.org/classes/TransactionManager)'s events:

```js
client.transactions.on('tip', (transaction) => {
  const readableAmount = transaction.amount.value;
  const currencyCode = transaction.amount.currencyCode;
  const sender = transaction.sender.username;

  console.log(`Received ${readableAmount} ${currencyCode} from ${sender}`);
});
```

### Fetching

You can also get a single or many transactions by id:

```js
client.on('ready', async () => {
  const oneTransaction = await client.transactions.fetch('one-id');
  const manyTransactions = await client.transactions.fetchMany([
    'this-id',
    'another-id',
  ]);
});
```

Getting transactions based on a filter is also possible:

```js
client.on('ready', async () => {
  const transactionsByFilter = await client.transactions.fetchAll({
    currency: 'BTC',
    limit: 5,
  });
});
```

Using no filter will get all transactions for the bot/user.
This is not recommended, unless you know what you're doing.

### Creating (sending)

You can send a transaction to one or more users:

```js
client.on('ready', async () => {
  const transaction = await client.transactions.create({
    recipient_s: ['discord-id-here'],
    value: '0.1',
    currencyCode: 'BTC',
  });

  const amount = transaction[0].amount;

  console.log(`${amount.value} ${amount.currencyCode} successfully sent to ${transaction[0].recipient.username}`);
});
```

Notice that you can choose between using a `rawValue` or `value` when sending a transaction.
The `value` will automatically get converted, while `rawValue` assumes you have done this conversion yourself.

## Exchange rates

Use the [ExchangeRateCache](https://tipccjs.org/classes/ExchangeRateCache) to get exchange rates:

```js
client.on('ready', async () => {
  const rate = client.exchangeRates.get('BTC');
  if (!rate) {
    console.log('The rate for BTC could not be found.');
  }

  console.log(`1 BTC is currently worth ${rate?.usdValue?.value} USD`);
});
```

This is also accessible on other structures, such as wallets:

```js
client.on('ready', async () => {
  const wallet = await client.wallets.fetch('BTC');
  if (!wallet) {
    return console.log('No BTC wallet found. Have you received any BTC?');
  }

  console.log(`1 BTC is now worth ${wallet.exchangeRate.usdValue} USD`);
});
```

## Currencies

The client provides caches for cryptocurrencies ([CryptocurrencyCache](https://tipccjs.org/classes/CryptocurrencyCache)) and fiats ([FiatCache](https://tipccjs.org/classes/FiatCache)).

This may be useful when you need some basic information about a currency.

Getting a cryptocurrency:

```js
client.on('ready', async () => {
  const btc = client.cryptos.get('BTC');
  if (!btc) {
    return console.log('Could not find BTC in the cache.');
  }

  console.log(`BTC's full name is ${btc.name}`);
  console.log(`BTC's explorer is ${btc.explorer}`);
});
```

Getting a fiat:

```js
client.on('ready', async () => {
  const usd = client.fiats.get('USD');
  if (!usd) {
    return console.log('Could not find USD in the cache.');
  }

  console.log(`USD's full name is ${usd.name}`);
  console.log(`USD uses ${usd.format.scale} decimals`);
});
```

## Exploring

Feel free to check out our [documentation](https://tipccjs.org/) to learn about our API and how you can use it.

Notice that the examples above are bits of code separated from each other.
You can often use provided properties to get your task done with fewer lines of code by combining the structures explained.

# License

This project is licensed under the [MIT License](https://github.com/tipccjs/tipcc.js/blob/main/LICENSE).

# Disclaimer

The authors of this package are not the authors of [tip.cc](https://tip.cc).
We are not responsible for any loss of funds caused by incorrect usage, bugs, exploits, or other causes when using this package.
