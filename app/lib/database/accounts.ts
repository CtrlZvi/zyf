import { eq, sql } from "drizzle-orm";

import { database } from "~/lib/database";
import {
    Account,
    CreateAccountData,
    accounts,
    accountDatabaseReadParser,
    createAccountDatabaseParser,
} from "~/routes/accounts/schema";

// TODO (zeffron 2024-01-01) Make this migrate on demand in development.
const fetchAccountsStatement = database.query.accounts.findMany().prepare();
export const fetchAccounts = async (): Promise<Account[]> =>
    fetchAccountsStatement
        .all()
        .map((account) => accountDatabaseReadParser.parse(account));

// TODO (zeffron 2024-01-01) Make this migrate on demand in development.
const fetchInternalAccountsStatement = database.query.accounts
    .findMany({
        where: eq(accounts.external, false),
    })
    .prepare();
export const fetchInternalAccounts = async (): Promise<Account[]> =>
    fetchInternalAccountsStatement
        .all()
        .map((account) => accountDatabaseReadParser.parse(account));

// TODO (zeffron 2024-01-02) Make this migrate on demand in development.
const fetchAccountByExternalIDStatement = database.query.accounts
    .findFirst({
        where: eq(accounts.externalID, sql.placeholder("externalID")),
    })
    .prepare();
// TODO (zeffron 2024-01-03) Error if there is more than one matching account.
export const fetchAccountByExternalID = async (
    externalID: string,
): Promise<Account> =>
    accountDatabaseReadParser.parse(
        fetchAccountByExternalIDStatement.get({ externalID: externalID }),
    );

// TODO (zeffron 2024-01-01) Make this migrate on demand in development.
// TODO (zeffron 2024-01-01) Convert to a prepared statement with a placeholder
// when https://github.com/drizzle-team/drizzle-orm/issues/976 is fixed.
// const createAccount = database.insert(accounts).values(sql.placeholder("account")).prepare();
export const createAccount = async (account: CreateAccountData) => {
    // TODO (zeffron 2024-01-03) Figure out a better way to handle errors.
    const parseResults = createAccountDatabaseParser.safeParse(account);
    if (!parseResults.success) {
        console.error(parseResults.error.flatten().fieldErrors);
    }

    const data = createAccountDatabaseParser.parse(account);

    // TODO (zeffron 2024-01-03) This needs to return the account that was
    // created.
    database.insert(accounts).values(data).execute();
};
