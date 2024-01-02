import { NavLink } from "@remix-run/react";

export default function Navigation() {
    return (
        <nav aria-label="Site navigation">
            <NavLink to="/accounts" prefetch="intent">
                Accounts
            </NavLink>
        </nav>
    );
}
