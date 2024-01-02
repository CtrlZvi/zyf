import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

import { database } from "~/lib/database";
import {
    Account,
    CreateAccountData,
    accountsTable as accounts,
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
// TODO (zeffron 2024-01-01) Convert to a prepared statement with a placeholder
// when https://github.com/drizzle-team/drizzle-orm/issues/976 is fixed.
// const createAccount = database.insert(accounts).values(sql.placeholder("account")).prepare();
export const createAccount = async (account: CreateAccountData) => {
    const data = createAccountDatabaseParser.parse(account);

    if (data.url !== undefined) {
        try {
            const url = new URL(data.url);
            const response = await fetch(
                `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`,
            );
            if (response.ok) {
                // FIXME (zeffron 2023-12-31) We need a better file name
                // convention as the account name is not guaranteed to be path
                // safe.
                await mkdir("public/account-icons", { recursive: true });
                data.icon = `/account-icons/${randomUUID()}`;
                await writeFile(
                    `public${data.icon}`,
                    new DataView(await (await response.blob()).arrayBuffer()),
                );
            }
        } catch (error) {
            console.warn(`Could not get favicon for ${account.name}: ${error}`);
        }
    }
    database.insert(accounts).values(data).execute();
};
