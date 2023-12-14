export const CurrencyList = ['USD', 'EUR', 'RUB'] as const;
export type Currency = (typeof CurrencyList)[number];
