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
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import Select, { OptionProps, components } from "react-select";
import { useState } from "react";

import { createAccountFormParser } from "~/routes/accounts/schema";
import { createAccount } from "~/lib/database/accounts";

export async function action({ request }: ActionFunctionArgs) {
    const parseResults = createAccountFormParser.safeParse(
        Object.fromEntries(await request.formData()),
    );

    if (!parseResults.success) {
        return json(parseResults.error.flatten().fieldErrors);
    }

    // TODO (zeffron 2024-01-01) This can throw (for example, if the unique
    // constraint is violated), and we need to handle that appropriately.
    await createAccount(parseResults.data);

    // FIXME (zeffron 2024-01-01) Need to submit the data to the database.
    return redirect("/accounts");
}

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

export default function CreateAccount() {
    const errors = useActionData<typeof action>();
    const [type, setType] = useState(
        accountTypeOptions[0] as AccountTypeOption | null,
    );

    return (
        // TODO (zeffron 2024-01-01) When Firefox supports <popover>, try using
        // a popover instead of an aside.
        <aside>
            <Form method="post">
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Account name"
                        aria-describedby="name-error"
                        aria-invalid={errors?.name !== undefined}
                    />
                </div>
                <div id="name-error" aria-live="polite" aria-atomic="true">
                    {errors?.name?.map((error: string) => (
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
                        aria-invalid={errors?.type !== undefined}
                    ></Select>
                </div>
                <div id="type-error" aria-live="polite" aria-atomic="true">
                    {errors?.type?.map((error: string) => (
                        <p key={error}>{error}</p>
                    )) ?? <></>}
                </div>
                {
                    // TODO (zeffron 2023-12-30) The checked status and
                    // defaulting is not working corretly. Automatically
                    // setting the check based on state doesn't seem to be
                    // propagated into the form data so reality doesn't match
                    // the UX.
                }
                <div>
                    <label htmlFor="external">External?</label>
                    {
                        // FIXME (zeffron) 2023-12-30 React complains that this
                        // switches from a controlled to uncontrolled component (or
                        // vice versa), so we probably need to just be fully
                        // controlled. Which will be required to fix the TODO
                        // above, anyway.
                    }
                    <input
                        id="external"
                        name="external"
                        type="checkbox"
                        value="true"
                        aria-live="polite"
                        aria-describedby="external-error"
                        aria-invalid={errors?.external !== undefined}
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
                    />
                </div>
                <div id="external-error" aria-live="polite" aria-atomic="true">
                    {errors?.external?.map((error: string) => (
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
                        aria-invalid={errors?.url !== undefined}
                    />
                </div>
                <div id="url-error" aria-live="polite" aria-atomic="true">
                    {errors?.url?.map((error: string) => (
                        <p key={error}>{error}</p>
                    )) ?? <></>}
                </div>
                <button type="submit">Create account</button>
            </Form>
        </aside>
    );
}
