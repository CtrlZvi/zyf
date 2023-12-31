"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";

import * as accountSchema from "@/app/accounts/schema";
import {
    createAccount as createAccountInDatabase,
    fetchAccounts as fetchAccountsFromDatabase,
} from "./database";

export async function createAccount(
    prevState: accountSchema.CreateAccountParseError,
    formData: FormData,
) {
    console.debug(`Form data:`);
    console.debug(Object.fromEntries(formData.entries()));
    const account = accountSchema.CreateAccount.safeParse(
        Object.fromEntries(formData.entries()),
    );
    console.debug(`Account:`);
    console.debug(account);

    if (!account.success) {
        return {
            errors: account.error.flatten().fieldErrors,
            message: "Failed to create account.",
        };
    }

    if (account.data.url) {
        try {
            const url = new URL(account.data.url);
            const response = await fetch(
                `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`,
            );
            if (response.ok) {
                // FIXME (zeffron 2023-12-31) We need a better file name
                // convention as the account name is not guaranteed to be path
                // safe.
                await mkdir("public/account-icons", { recursive: true });
                const path = await writeFile(
                    `public/account-icons/${account.data.name}`,
                    new DataView(await (await response.blob()).arrayBuffer()),
                );
                account.data.icon = `/account-icons/${account.data.name}`;
            }
        } catch (error) {
            console.warn(
                `Could not get favicon for ${account.data.name}: ${error}`,
            );
        }
    }

    // FIXME (zeffron 2023-12-31) This can fail. For example, the unique
    // constraint could be violated. If it fails, it will throw an exception.
    // We need to catch it and handle it.
    await createAccountInDatabase(account.data);

    revalidatePath("/accounts");
    // FIXME (zeffron 2023-12-30) The redirect does not seem to cause a visual
    // change. We keep the creation panel open and the account list does not
    // update. Try route interception to see if we can use the "modal" pattern
    // for the portal.
    redirect("/accounts");
}

export async function fetchAccounts() {
    return (await fetchAccountsFromDatabase()).map((account) =>
        accountSchema.Account.parse(account),
    );
}
