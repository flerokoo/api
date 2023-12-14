import { User } from '../../db/models/User.js';


export interface ICategory {
  id?: number;
  name: string;
  owner?: User;
}
