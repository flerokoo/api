import { DeepPartial } from 'typeorm';
import { Spend } from '../../db/models/Spend.js';
import { ISpend } from '../entities/ISpend.js';


export interface ISpendRepository {
  create(): ISpend;
  save(entities: ISpend[]): Promise<void>;
  select(where: {}, limit?:number, offset?:number) : Promise<ISpend[]>
}
