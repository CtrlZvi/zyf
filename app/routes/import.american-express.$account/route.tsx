import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Select, {
    OptionProps,
    SingleValueProps,
    components,
} from "react-select";

import AccountIcon from "~/components/account-icon";
import {
    fetchAccountByExternalID,
    fetchInternalAccounts,
} from "~/lib/database/accounts";
import { Account, accountFromJSONParser } from "~/routes/accounts/schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    console.log(params.account);
    const internalAccounts = fetchInternalAccounts();
    try {
        // TODO (zeffron 2024-01-03) Cancel the fetch of the internal accounts
        // if we find a matching account.
        return json({
            accounts: await fetchAccountByExternalID(params.account),
        });
    } catch {
        return json({ accounts: await internalAccounts });
    }
};

const Option = (
    props: OptionProps<{ value: number; label: string; account: Account }>,
) => {
    return (
        <components.Option {...props}>
            <AccountIcon account={props.data.account} />
            {props.data.account.name}
        </components.Option>
    );
};

const SingleValue = ({
    children,
    ...props
}: SingleValueProps<{ value: number; label: string; account: Account }>) => (
    <components.SingleValue {...props}>
        <AccountIcon account={props.data.account} />
        {children}
    </components.SingleValue>
);

export default function Import() {
    const accounts = useLoaderData<typeof loader>().accounts.map((account) =>
        accountFromJSONParser.parse(account),
    );
    // TODO (zeffron 2024-01-03) Add an option that will automatically create a
    // matching account.
    const options = accounts.map((account) => ({
        value: account.id,
        label: account.name,
        account: account,
    }));

    return (
        <div>
            <label htmlFor="account">Account:</label>
            {
                // FIXME (zeffron 2023-12-18) The default styles for the Select
                // component do not adapt to dark mode.
                // See https://github.com/JedWatson/react-select/issues/2640
                // for how to use media queries which will probably be
                // similar to what's necessary for dark mode responsiveness.
            }
            <Select
                id="account"
                name="account"
                options={options}
                components={{ Option, SingleValue }}
            ></Select>
            <button type="submit">Import</button>
        </div>
    );
}
