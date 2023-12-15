import config from '../../config.js';
import { ApplicationServices } from '../../services/init-services.js';
import { IRequest } from '../../utils/Request.js';

export interface IController { 
  [key: string] : (req : IRequest) => Promise<void>;
}

export type ControllerCtor = {
  new (services: ApplicationServices) : IController;
};

export async function initControllers(services: ApplicationServices) : Promise<IController[]> {
  return config.controllers.map(ctor => new ctor(services)) as unknown as IController[];
}