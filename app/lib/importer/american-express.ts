import { find, textContent } from "domutils";
import { ElementType, parseDocument } from "htmlparser2";
import transit from "transit-immutable-js";

// Updates the user session so the cookie stays valid.
const updateUserSession = async ({ cookie }: { cookie: string }) => {
    console.log("Updating the user token...");

    const session = await fetch(
        "https://functions.americanexpress.com/UpdateUserSession.v1",
        {
            method: "POST",
            body: "{}",
            headers: {
                Cookie: cookie,
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
    const expiresAt = new Date(
        sessionExpiry < tokenExpiry ? sessionExpiry : tokenExpiry,
    );

    console.log(`User token now expires at ${expiresAt}`);
    setTimeout(
        updateUserSession,
        expiresAt.getTime() - 60 * 1000 - Date.now(),
        { cookie },
    );
};

export default async function importer({ cookie }: { cookie: string }) {}

export async function fetchAccounts({ cookie }: { cookie: string }) {
    // First thing we do is set up a background refresh of the token so it
    // doesn't expire.
    // TODO (zeffron 2024-01-02) Make this refresh last only as long as the
    // import.
    updateUserSession({ cookie });

    // Best way to extract the cookie is to copy cURL from ReadCustomerProductDetails.v1 request
    // First, we need to get the initial data state from American Express. That
    // is served in an inline script in the HTML that is returned from
    // https://global.americanexpress.com/dashboard. So first we fetch it and
    // parse it to extract the initial state.
    // cURL: curl 'https://global.americanexpress.com/dashboard' --compressed -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Cookie: [object Object]' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: same-site' -H 'Sec-Fetch-User: ?1' -H 'Sec-GPC: 1' -H 'TE: trailers'
    const dashboard = await fetch(
        "https://global.americanexpress.com/dashboard",
        {
            headers: {
                Cookie: cookie,
            },
        },
    );
    if (!dashboard.ok) {
        // TODO (zeffron 2024-01-02) Appropriately handle the error.
        return;
    }
    if (dashboard.url !== "https://global.americanexpress.com/dashboard") {
        // TODO (zeffron 2024-01-02) Appropriately handle the error and
        // indicate the cookie is not valid.
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

    const initialState = transit.fromJSON(
        textContent(scripts[0])
            .match(/^\s*window\.__INITIAL_STATE__\s*=\s*"(.*)";\s*$/m)[1]
            .replaceAll('\\"', '"')
            .replaceAll("\\\\", "\\"),
    );
    const accounts = [
        ...initialState
            .get("modules")
            ?.get("axp-myca-root")
            .get("products")
            .get("registry")
            .get("types")
            .values(),
    ].flat();
    return accounts;
}
