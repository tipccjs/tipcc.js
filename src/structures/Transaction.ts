import { Amount } from './Amount';
import { TipccClient } from './TipccClient';
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

  /** The client that instantiated this transaction */
  public client: TipccClient | undefined;

  /**
   * Create a Transaction.
   * @param payload The transaction from the API
   */
  constructor(payload: APITransaction, client?: TipccClient) {
    if (client) this.client = client;
    this.id = payload.id;
    this.type = payload.type;
    this.amount = new Amount(payload.amount, this.client);
    this.fee = payload.fee ? new Amount(payload.fee, this.client) : null;
    this.service = payload.service;
    this.chatId = payload.chat_id ?? null;
    this.subchatId = payload.subchat_id ?? null;
    this.sender = new User(payload.sender);
    this.recipient = new User(payload.recipient);
    this.created = new Date(payload.created);
  }
}
