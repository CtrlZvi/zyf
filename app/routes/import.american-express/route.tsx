import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Outlet, useFetcher, useNavigate } from "@remix-run/react";
import Select from "react-select";

import importer, { fetchAccounts } from "~/lib/importer/american-express";

// TODO (zeffron 2024-01-02) This should be a loader instead of an action.
export async function action({ request }: ActionFunctionArgs) {
    // TODO (zeffron 2024-01-02) Create a proper parser for the form.
    const cookie = (await request.formData()).get("cookie");
    if (typeof cookie !== "string") {
        return json({ accounts: [] });
    }

    // TODO (zeffron 2024-01-02) Make this truly asynchronous for the client.
    // Ideally the client can track imports in progress and navigating won't
    // break or lose them.
    const accounts = await fetchAccounts({ cookie });
    return json({ accounts: accounts });
}

export const handle = {
    importer: { name: "American Express", importer: importer },
};

export default function ImportAmericanExpress() {
    const fetcher = useFetcher<typeof action>();
    const navigate = useNavigate();

    return (
        <Form method="post">
            <div>
                <label htmlFor="cookie">Cookie:</label>
                <input
                    id="cookie"
                    name="cookie"
                    type="text"
                    placeholder="Cookie"
                    aria-describedby="cookie-error"
                    // aria-invalid={errors?.name !== undefined}
                    onChange={(event) =>
                        fetcher.submit(
                            { cookie: event.currentTarget.value },
                            { method: "POST" },
                        )
                    }
                />
            </div>
            <div id="cookie-error" aria-live="polite" aria-atomic="true">
                {/* {errors?.name?.map((error: string) => (
                        <p key={error}>{error}</p>
                    )) ?? <></>} */}
            </div>
            <Select
                id="account"
                name="account"
                options={fetcher.data?.accounts?.map((account) => ({
                    value: account.opaqueAccountId,
                    label: account.type,
                }))}
                onChange={(option) => navigate(option?.value)}
            ></Select>
            <Outlet />
        </Form>
    );
}
