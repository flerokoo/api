import { DataSource, DeepPartial } from 'typeorm';
import { IUser } from '../entities/IUser.js';

export interface IUserRepository {
  select(params?: {}): Promise<IUser[]>;
  insert(username: string, password: string): Promise<number>;
}
