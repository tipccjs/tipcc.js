import type { APIConnection } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API user.
 *
 * @category API Classes
 */
export class User {
  /** The identifier (id) of this user */
  public identifier: string;

  /** The user's username */
  public username: string | null;

  /** The user's avatar URL */
  public avatarUrl: string | null;

  /** The service where this user is registered */
  public service: 'discord';

  /**
   * Create a User.
   * @param payload The user from the API
   */
  constructor(payload: APIConnection) {
    this.identifier = payload.identifier;
    this.username = payload.username ?? null;
    this.avatarUrl = payload.avatar_url ?? null;
    this.service = payload.service;
  }
}
