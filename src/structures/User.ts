import type { APIConnection } from '@tipccjs/tipcc-api-types';

/**
 * A class for storing an API user.
 */
export default class User {
  public identifier: string;

  public username?: string;

  public avatarUrl?: string;

  public service: 'discord';

  /**
   * Create a User.
   * @param payload The user from the API
   */
  constructor(payload: APIConnection) {
    this.identifier = payload.identifier;
    this.username = payload.username;
    this.avatarUrl = payload.avatar_url;
    this.service = payload.service;
  }
}
