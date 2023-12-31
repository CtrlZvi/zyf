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
import Image from "next/image";
import Link from "next/link";

import { Account } from "./schema";
import styles from "./page.module.css";

import { fetchAccounts } from "@/lib/accounts";

const accountTypeIcon = (account: Account) => {
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

export default async function Accounts() {
    const accounts = await fetchAccounts();

    return (
        <div id={styles.accounts}>
            <table>
                <thead>
                    <tr>
                        <td></td>
                        <td>Account</td>
                        <td>Type</td>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account.id}>
                            <td>
                                {account?.icon ? (
                                    <Image
                                        src={account.icon}
                                        alt={`${account.name} icon`}
                                        width={32}
                                        height={32}
                                        // FIXME (zeffron 2023-12-31) We want the icon to be based on the
                                        // text size. This correctly handles positioning and height, but
                                        // not preserving the aspect ratio. We also don't want to depend on
                                        // Font Awesome styles.
                                        className={styles.icon}
                                    ></Image>
                                ) : (
                                    <></>
                                )}
                            </td>
                            <td>{account.name}</td>
                            <td>{accountTypeIcon(account)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link href="/account/new">
                <div>
                    <FontAwesomeIcon icon={faSquarePlus} />
                    Create Account
                </div>
            </Link>
        </div>
    );
}
