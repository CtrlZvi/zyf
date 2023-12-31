import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

export const accountTypes = ["cash", "savings", "checking", "loan", "payment card", "merchant", "person"] as const;
const knownInstitutions = ["American Express", "J.P. Morgan Chase", "Discover"] as const;

const AccountBase = z.object({
    id: z.number().int().nonnegative(),
    name: z.string().min(1),
    type: z.enum(accountTypes),
    internal: z.coerce.boolean(),
    institution: z.enum(knownInstitutions).or(z.string()).nullish(),
    number: z.string().nullish(),
    // TODO (zeffron 2023-12-31) Figure out how to have a URL type for the
    // application and a string type for the database.
    url: z.string().url().nullish(),
    icon: z.string().nullish(),
    initialBalance: z.number().int().nullish(),
    initialBalanceDate: z.date().max(new Date()).nullish(),
    minimum_balance: z.number().int().nonnegative().default(0),
}).strict();

const addCustomAccountValidations = <T extends z.ZodRawShape>(object: z.ZodObject<T>) => object.refine(
    (account) =>
        (!["merchant", "person"].includes(account.type) || account.institution === undefined || account.institution === null),
    { message: "Merchants and people are not financial institutions", path: ["institution"] }
).refine(
    (account) =>
        (account.initialBalance === undefined || account.initialBalance === null) === (account.initialBalanceDate === undefined || account.initialBalanceDate === null),
    { message: "An initial balance must have a date", path: ["initialBalanceDate"] }
).refine(
    (account) => (!["merchant", "person"].includes(account.type) || !account.internal),
    { message: "Merchants and people must be external accounts", path: ["internal"] }
);

export const Account = addCustomAccountValidations(AccountBase);
export type Account = z.infer<typeof Account>;

// TODO (zeffron 2023-12-31) We need to split this into two more types: one for
// validating the input to the database and one for validating the input from
// the form. The reason being that we don't want to permit the form to send the
// icon field, but we need to be able to set it for the database.
export const CreateAccount = addCustomAccountValidations(AccountBase.omit({ id: true }));
export type CreateAccount = z.infer<typeof CreateAccount>;
export type CreateAccountParseError = {
    errors?: {
        [Property in keyof CreateAccount]?: string[]
    },
    message?: string | null
}

export const accounts = sqliteTable(
    'accounts',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name').notNull(),
        type: text('type', { enum: accountTypes }).notNull(),
        internal: integer('internal', { mode: 'boolean' }).notNull(),
        institution: text('institution'),
        number: text('number'),
        url: text('url'),
        icon: text('icon'),
        initialBalance: integer('initial_balance'),
        initialBalanceDate: integer('initial_balance_date', { mode: 'timestamp' }),
        minimum_balance: integer('minimum_balance').notNull().default(0),
    },
    (table) => ({
        uniqueHumanIdentifier: uniqueIndex('human_identifier_idx').on(table.name, table.type),
        uniqueAccountNumber: uniqueIndex('account_number_idx').on(table.name, table.type),
    }),
);


