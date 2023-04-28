import { Amount } from './Amount';
import { User } from './User';
import type { APITransaction } from '@tipccjs/tipcc-api-types/v0';

/**
 * A class for storing an API transaction.
 *
 * @category API Classes
 */
export class Transaction {
  /** The transaction id */
  public id: string;

  /** The type of transaction */
  public type: 'tip' | 'withdrawal' | 'deposit' = 'tip';

  /** An instance of {@link Amount} for this transaction */
  public amount: Amount;

  /** An instance of {@link Amount} for the fee of this transaction */
  public fee: Amount | null = null;

  /** An instance of {@link Amount} for the USD value of this transaction */
  public usdValue: Amount | null = null;

  /** The service in which this transaction took place */
  public service = 'discord' as const;

  /** The chat (guild) id where this transaction took place */
  public chatId: string | null;

  /** The subchat (channel) id where this transaction took place */
  public subchatId: string | null;

  /** The id of the sender */
  public sender: User;

  /** The id of the recipient */
  public recipient: User;

  /** The Date when this transaction was created */
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
