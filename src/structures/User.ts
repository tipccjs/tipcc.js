import type { APIConnection } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API user.
 */
export class User {
  public identifier: string;

  public username: string | null;

  public avatarUrl: string | null;

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
