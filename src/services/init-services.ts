import { ApplicationRepositories } from '../db/init-repositories.js';
import { SpendService } from './SpendService.js';
import { AuthService } from './AuthService.js';
import { CategoryService } from './CategoryService.js';

export type ApplicationServices = {
  AuthService: AuthService;
  SpendService: SpendService;
  CategoryService: CategoryService;
};

export async function initServices(repos: ApplicationRepositories): Promise<ApplicationServices> {
  return {
    AuthService: new AuthService(repos),
    SpendService: new SpendService(repos),
    CategoryService: new CategoryService(repos)
  };
}
