import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Outlet, useFetcher, useNavigate } from "@remix-run/react";
import Select, {
    OptionProps,
    SingleValueProps,
    components,
} from "react-select";
import { z } from "zod";
import { zx } from "zodix";

import styles from "~/components/account-icon/component.module.css";
import importer, { fetchAccounts } from "~/lib/importer/american-express";
import { createAccount } from "~/lib/database/accounts";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
    z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

export async function action({ request }: ActionFunctionArgs) {
    const { cookies, americanExpressAccount, zyfAccount } = await zx.parseForm(
        request,
        {
            cookies: z.string(),
            americanExpressAccount: z
                .string()
                .transform((value) => JSON.parse(value)),
            zyfAccount: z
                .string()
                .max(0)
                .transform(() => undefined)
                .or(z.coerce.number())
                .optional(),
        },
    );

    if (zyfAccount === undefined) {
        const data = {
            type: {
                CARD_PRODUCT: "payment card",
                AEXP_PERSONAL_CHECKING_ACCOUNT: "checking",
                AEXP_PERSONAL_SAVING_ACCOUNT: "savings",
            }[americanExpressAccount.type],
            name: americanExpressAccount.name,
            external: false,
            externalID: americanExpressAccount.opaqueAccountId,
        };

        if (americanExpressAccount.art !== undefined) {
            try {
                const response = await fetch(americanExpressAccount.art);
                if (response.ok) {
                    // FIXME (zeffron 2023-12-31) We need a better file name
                    // convention as the account name is not guaranteed to be path
                    // safe.
                    await mkdir("public/account-icons", { recursive: true });
                    data.icon = `/account-icons/${randomUUID()}`;
                    await writeFile(
                        `public${data.icon}`,
                        new DataView(
                            await (await response.blob()).arrayBuffer(),
                        ),
                    );
                }
            } catch (error) {
                console.warn(
                    `Could not get the account icon for ${data.name}: ${error}`,
                );
            }
        }

        // TODO (zeffron 2024-01-01) This can throw (for example, if the unique
        // constraint is violated), and we need to handle that appropriately.
        await createAccount(data);
    }
    return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
    // TODO (zeffron 2024-01-02) Create a proper parser for the form.
    const cookies = new URL(request.url).searchParams.get("cookies");
    if (typeof cookies !== "string") {
        return json({ accounts: [] });
    }

    // TODO (zeffron 2024-01-02) Make this truly asynchronous for the client.
    // Ideally the client can track imports in progress and navigating won't
    // break or lose them.
    const accounts = await fetchAccounts({ cookies });
    return json({ accounts: accounts });
}

export const handle = {
    importer: { name: "American Express", importer: importer },
};

const Option = (
    props: OptionProps<{ value: number; label: string; account: unknown }>,
) => (
    <components.Option {...props}>
        <img
            src={props.data.account.art}
            alt={`${props.data.label} icon`}
            className={styles.icon}
        />
        {props.data.label}
    </components.Option>
);

const SingleValue = ({
    children,
    ...props
}: SingleValueProps<{ value: number; label: string; account: unknown }>) => (
    <components.SingleValue {...props}>
        <img
            src={props.data.account.art}
            alt={`${props.data.label} icon`}
            className={styles.icon}
        />
        {children}
    </components.SingleValue>
);

export default function ImportAmericanExpress() {
    const fetcher = useFetcher<typeof loader>();
    const navigate = useNavigate();

    return (
        <Form method="post">
            <div>
                <label htmlFor="cookies">Cookies:</label>
                <input
                    id="cookies"
                    name="cookies"
                    type="text"
                    placeholder="Cookies"
                    aria-describedby="cookies-error"
                    // aria-invalid={errors?.name !== undefined}
                    onChange={(event) =>
                        fetcher.submit(
                            { cookies: event.currentTarget.value },
                            { method: "get" },
                        )
                    }
                />
            </div>
            <div id="cookies-error" aria-live="polite" aria-atomic="true">
                {/* {errors?.name?.map((error: string) => (
                        <p key={error}>{error}</p>
                    )) ?? <></>} */}
            </div>
            <Select
                id="americanExpressAccount"
                name="americanExpressAccount"
                options={fetcher.data?.accounts?.map((account) => ({
                    value: JSON.stringify(account),
                    label: account.name,
                    account: account,
                }))}
                components={{ Option, SingleValue }}
                onChange={(option) => navigate(option?.account.opaqueAccountId)}
            ></Select>
            <Outlet />
        </Form>
    );
}
