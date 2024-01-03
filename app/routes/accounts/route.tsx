import {
    faSquarePlus,
    faCreditCard,
    faWallet,
    faPiggyBank,
    faMoneyCheck,
    faHandHoldingDollar,
    faCashRegister,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import AccountIcon from "~/components/account-icon";
import { fetchAccounts } from "~/lib/database/accounts";

import styles from "./route.module.css";
import { Account, accountFromJSONParser } from "./schema";

const accountTypeIcon = (account: Account) => {
    // FIXME (zeffron 2024-01-01) This generates warnings in the client console
    // on page refreshes when rendered.
    switch (account.type) {
        case "cash":
            return <FontAwesomeIcon icon={faWallet} title="Cash" />;
        case "savings":
            return <FontAwesomeIcon icon={faPiggyBank} title="Savings" />;
        case "checking":
            return <FontAwesomeIcon icon={faMoneyCheck} title="Checking" />;
        case "loan":
            return <FontAwesomeIcon icon={faHandHoldingDollar} title="Loan" />;
        case "payment card":
            return <FontAwesomeIcon icon={faCreditCard} title="Payment Card" />;
        case "merchant":
            return <FontAwesomeIcon icon={faCashRegister} title="Merchant" />;
        case "person":
            return <FontAwesomeIcon icon={faUser} title="Person" />;
    }
};

export const loader = async () => {
    const accounts = await fetchAccounts();
    return json({ accounts });
};

export default function Accounts() {
    const accounts = useLoaderData<typeof loader>().accounts.map((account) =>
        accountFromJSONParser.parse(account),
    );

    return (
        <>
            <main>
                <table id={styles.accounts}>
                    <thead>
                        <tr>
                            <td></td>
                            <td>Account</td>
                            <td>Type</td>
                            <td>URL</td>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td>
                                    <AccountIcon account={account} />
                                </td>
                                <td>{account.name}</td>
                                <td>{accountTypeIcon(account)}</td>
                                <td>{account.url?.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Link to="/accounts/create">
                    <FontAwesomeIcon icon={faSquarePlus} />
                    Create Account
                </Link>
            </main>
            <Outlet />
        </>
    );
}
