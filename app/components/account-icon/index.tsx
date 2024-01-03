import { Account } from "~/routes/accounts/schema";

import styles from "./component.module.css";

export default function AccountIcon({ account }: { account: Account }) {
    return account.icon !== undefined ? (
        <img
            src={account.icon}
            alt={`${account.name} icon`}
            className={styles.icon}
        />
    ) : (
        <></>
    );
}
