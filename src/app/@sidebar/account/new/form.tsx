"use client";

// Since we already added the CSS in the layout, as a workaround to an issue
// where the CSS wasn't getting added, we prevent its addition here to avoid
// duplicate styles and wasted bytes in transfer. Otherwise, this gets added as
// an inline style.
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import {
    faCreditCard,
    faWallet,
    faPiggyBank,
    faMoneyCheck,
    faHandHoldingDollar,
    faCashRegister,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useFormState } from "react-dom";
import Select, { components, defaultTheme, OptionProps } from "react-select";

import { createAccount } from "@/lib/accounts";
import { accountTypes, CreateAccountParseError } from "@/app/accounts/schema";

const AccountTypeOption = (
    props: OptionProps<{
        readonly value: string;
        readonly label: string;
        readonly icon: typeof FontAwesomeIcon;
    }>,
) => (
    <div>
        <FontAwesomeIcon icon={faCreditCard} />
        <components.Option {...props} />
    </div>
);

export interface AccountTypeOption {
    readonly value: string;
    readonly label: string;
    // TODO (zeffron 2023-12-28) See if there's a more specific type that only
    // allows this to be a FontAwesomeIcon instead of any JSX Element.
    readonly icon: JSX.Element;
}

export const accountTypeOptions: readonly AccountTypeOption[] = [
    { value: "cash", label: "Cash", icon: <FontAwesomeIcon icon={faWallet} /> },
    {
        value: "savings",
        label: "Savings",
        icon: <FontAwesomeIcon icon={faPiggyBank} />,
    },
    {
        value: "checking",
        label: "Checking",
        icon: <FontAwesomeIcon icon={faMoneyCheck} />,
    },
    {
        value: "loan",
        label: "Loan",
        icon: <FontAwesomeIcon icon={faHandHoldingDollar} />,
    },
    {
        value: "payment card",
        label: "Payment Card",
        icon: <FontAwesomeIcon icon={faCreditCard} />,
    },
    {
        value: "merchant",
        label: "Merchant",
        icon: <FontAwesomeIcon icon={faCashRegister} />,
    },
    {
        value: "person",
        label: "Person",
        icon: <FontAwesomeIcon icon={faUser} />,
    },
];

const Option = (props: OptionProps<AccountTypeOption>) => {
    return (
        <div>
            <components.Option {...props}>
                {props.data.icon}
                {props.data.label}
            </components.Option>
        </div>
    );
};

export default function Form() {
    const initialState: CreateAccountParseError = {};
    const [state, dispatch] = useFormState(createAccount, initialState);
    console.debug(state);
    const [type, setType] = useState(
        accountTypeOptions[0] as AccountTypeOption | null,
    );

    return (
        <form action={dispatch}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Account name"
                    aria-describedby="name-error"
                    aria-invalid={state.errors?.name !== undefined}
                />
            </div>
            <div id="name-error" aria-live="polite" aria-atomic="true">
                {state.errors?.name?.map((error: string) => (
                    <p key={error}>{error}</p>
                )) ?? <></>}
            </div>
            <div>
                <label htmlFor="type">Type:</label>
                {
                    // FIXME (zeffron 2023-12-18) The default styles for the Select
                    // component do not adapt to dark mode.
                    // See https://github.com/JedWatson/react-select/issues/2640
                    // for how to use media queries which will probably be
                    // similar to what's necessary for dark mode responsiveness.
                }
                <Select
                    id="type"
                    name="type"
                    aria-errormessage="type-error"
                    aria-live="polite"
                    options={accountTypeOptions}
                    components={{ Option }}
                    defaultValue={accountTypeOptions[0]}
                    onChange={(value) => setType(value)}
                    isMulti={
                        // This needs to be set to false and not undefined to
                        // make the type of onChange work with setType()
                        false
                    }
                    aria-invalid={state.errors?.type !== undefined}
                ></Select>
            </div>
            <div id="type-error" aria-live="polite" aria-atomic="true">
                {state.errors?.type?.map((error: string) => (
                    <p key={error}>{error}</p>
                )) ?? <></>}
            </div>
            {
                // TODO (zeffron 2023-12-30) Investigate using a <fieldset>
                // instead of a <div> to group the buttons.
                // TODO (zeffron 2023-12-30) The checked status and defaulting
                // is not doing exactly what I want, but I'm also not 100% what
                // the differences are, so it's had to code.
            }
            <div
                role="radiogroup"
                aria-errormessage="internal-error"
                aria-invalid={state.errors?.internal !== undefined}
            >
                <label htmlFor="internal">Internal</label>
                <input
                    type="radio"
                    id="internal"
                    name="internal"
                    value="true"
                    aria-live="polite"
                    disabled={["person", "merchant"].includes(
                        type?.value ?? "",
                    )}
                    defaultChecked={
                        !["person", "merchant", "cash"].includes(
                            type?.value ?? "",
                        )
                    }
                ></input>
                <label htmlFor="external">External</label>
                {
                    // FIXME (zeffron) 2023-12-30 React complains that this
                    // switches from a controlled to uncontrolled component (or
                    // vice versa), so we probably need to just be fully
                    // controlled. Which will be required to fix the TODO
                    // above, anyway.
                }
                <input
                    type="radio"
                    id="external"
                    name="internal"
                    value="false"
                    aria-live="polite"
                    disabled={["person", "merchant"].includes(
                        type?.value ?? "",
                    )}
                    defaultChecked={["person", "merchant", "cash"].includes(
                        type?.value ?? "",
                    )}
                    checked={
                        ["person", "merchant"].includes(type?.value ?? "")
                            ? true
                            : undefined
                    }
                ></input>
            </div>
            <div
                id="internal-error"
                aria-live="polite"
                aria-atomic="true"
                role="desc"
            >
                {state.errors?.internal?.map((error: string) => (
                    <p key={error}>{error}</p>
                )) ?? <></>}
            </div>
            <div>
                <label htmlFor="url">URL:</label>
                <input
                    id="url"
                    name="url"
                    type="text"
                    placeholder="URL"
                    aria-describedby="url-error"
                    aria-invalid={state.errors?.url !== undefined}
                />
            </div>
            <div id="url-error" aria-live="polite" aria-atomic="true">
                {state.errors?.url?.map((error: string) => (
                    <p key={error}>{error}</p>
                )) ?? <></>}
            </div>
            <button type="submit">Create account</button>
        </form>
    );
}
