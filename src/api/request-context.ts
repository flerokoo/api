import { AsyncLocalStorage } from "async_hooks";
import { IUser } from "../domain/entities/IUser.js";

export type RequestContext = {
  user?: IUser;
};

const contextStorage = new AsyncLocalStorage<RequestContext>();

export function runRequestWithinContext(context: RequestContext, fn: () => unknown) {
  contextStorage.run(context, fn);
}

export function hasCurrentUser() : boolean {
  return Boolean(contextStorage.getStore()?.user);
}

export function getCurrentUser(): IUser {
  return contextStorage.getStore()?.user as IUser;
}

export function setCurrentUser(user :IUser) {
  const store = contextStorage.getStore() as RequestContext;
  store.user = user;
}