import { find, textContent } from "domutils";
import { ElementType, parseDocument } from "htmlparser2";
import transit from "transit-immutable-js";

// Updates the user session so the cookies stay valid.
const updateUserSession = async ({ cookies }: { cookies: string }) => {
    console.log("Updating the user token...");

    const session = await fetch(
        "https://functions.americanexpress.com/UpdateUserSession.v1",
        {
            method: "POST",
            body: "{}",
            headers: {
                Cookie: cookies,
            },
        },
    );
    if (!session.ok) {
        console.warn(`Failed to refresh the session: ${await session.text()}`);
        return;
    }
    const json = await session.json();
    const {
        sessionExpiry,
        tokenExpiry,
    }: { sessionExpiry: string; tokenExpiry: string } = json;
    // TODO (zeffron 2024-01-02) Use the server timestamp to ensure things are
    // properly synced.
    const expiresAt = new Date(
        sessionExpiry < tokenExpiry ? sessionExpiry : tokenExpiry,
    );

    console.log(`User token now expires at ${expiresAt}`);
    setTimeout(
        updateUserSession,
        expiresAt.getTime() - 60 * 1000 - Date.now(),
        { cookies },
    );
};

export default async function importer({ cookies }: { cookies: string }) {}

export async function fetchAccounts({ cookies }: { cookies: string }) {
    // First thing we do is set up a background refresh of the token so it
    // doesn't expire.
    // TODO (zeffron 2024-01-02) Make this refresh last only as long as the
    // import.
    updateUserSession({ cookies });

    // Best way to extract the cookies is to copy it from the
    // UpdateUserSession.v1 request.
    // The accounts are only together as a complete set in the initial data
    // state which is served as an inline script in the HTML that is returned
    // from https://global.americanexpress.com/dashboard.
    const dashboard = await fetch(
        "https://global.americanexpress.com/dashboard",
        {
            headers: {
                Cookie: cookies,
            },
        },
    );
    if (!dashboard.ok) {
        // TODO (zeffron 2024-01-02) Appropriately handle the error.
        return;
    }
    if (dashboard.url !== "https://global.americanexpress.com/dashboard") {
        // TODO (zeffron 2024-01-02) Appropriately handle the error and
        // indicate the cookies are not valid.
        return;
    }

    const document = parseDocument(await dashboard.text());
    const scripts = find(
        (node) =>
            node.type === ElementType.Script &&
            node.attribs["id"] == "initial-state",
        document.childNodes,
        true,
        1,
    );
    const serializedState = textContent(scripts[0])
        .match(/^\s*window\.__INITIAL_STATE__\s*=\s*"(.*)";\s*$/m)[1]
        .replaceAll('\\"', '"')
        .replaceAll("\\\\", "\\");

    // We discovered via reverse engineering that the state is serialized using
    // transit and Immutable.js.
    const initialState = transit.fromJSON(serializedState);
    const accounts = [
        ...initialState
            .get("modules")
            ?.get("axp-myca-root")
            .get("products")
            .get("registry")
            .get("types")
            .values(),
    ].flat();
    const initialDetails = initialState
        .get("modules")
        ?.get("axp-myca-root")
        .get("products")
        .get("details")
        .get("types");

    // Some accounts have their details in the initial state, so we extract it
    // from there.
    for (const account of accounts) {
        const accountDetails = initialDetails.get(account.type)?.productsList[
            account.opaqueAccountId
        ];
        if (accountDetails === undefined) {
            continue;
        }
        account.name = accountDetails.product.description;
        account.art = accountDetails.product.large_card_art;
    }

    // Other accounts need their details to be fetched. These details differ in
    // format from the ones in the initial state.
    const detailsResponse = await fetch(
        "https://functions.americanexpress.com/ReadCustomerProductDetails.v1",
        {
            method: "POST",
            body: JSON.stringify(
                accounts.reduce((accounts, account) => {
                    if (!Object.hasOwn(accounts, account.type)) {
                        accounts[account.type] = { accountIds: [] };
                    }
                    accounts[account.type].accountIds.push(
                        account.opaqueAccountId,
                    );
                    return accounts;
                }, {}),
            ),
            headers: {
                Cookie: cookies,
            },
        },
    );
    // TODO (zeffron 2024-01-03) Check for failure and handle the error.
    const details = await detailsResponse.json();
    for (const account of accounts) {
        const accountDetails = details.results[account.type]?.find(
            (details) => details.opaqueAccountId === account.opaqueAccountId,
        );
        if (accountDetails === undefined) {
            continue;
        }
        account.name = accountDetails.productDisplayName;
        account.art = accountDetails.digitalAssetUrl.large;
    }
    return accounts;
}
