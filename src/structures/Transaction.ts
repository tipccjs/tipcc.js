import { Amount } from './Amount';
import { User } from './User';
import type { APITransaction } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API transaction.
 *
 * @category API Classes
 */
export class Transaction {
  public id: string;

  public type: 'tip' | 'withdrawal' | 'deposit' = 'tip';

  public amount: Amount;

  public fee: Amount | null = null;

  public usdValue: Amount | null = null;

  public service = 'discord' as const;

  public chatId: string;

  public subchatId: string;

  public sender: User;

  public recipient: User;

  public created: Date;

  /**
   * Create a Transaction.
   * @param payload The transaction from the API
   */
  constructor(payload: APITransaction) {
    this.id = payload.id;
    this.type = payload.type;
    this.amount = new Amount(payload.amount);
    this.fee = payload.fee ? new Amount(payload.fee) : null;
    this.usdValue = payload.usd_value ? new Amount(payload.usd_value) : null;
    this.service = payload.service;
    this.chatId = payload.chat_id;
    this.subchatId = payload.subchat_id;
    this.sender = new User(payload.sender);
    this.recipient = new User(payload.recipient);
    this.created = new Date(payload.created);
  }
}
