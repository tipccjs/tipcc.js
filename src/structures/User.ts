import { ApiUser } from '../types/TipccApi';

export default class User {
  public identifier: string;

  public username: string;

  public avatarUrl: string;

  public service: 'discord';

  constructor(payload: ApiUser) {
    this.identifier = payload.identifier;
    this.username = payload.username;
    this.avatarUrl = payload.avatar_url;
    this.service = payload.service;
  }
}
