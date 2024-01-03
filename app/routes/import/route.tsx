import { Outlet, useMatches, useNavigate } from "@remix-run/react";
import Select from "react-select";

import importers from "~/lib/importer";

export default function Import() {
    const options = importers.map((importer) => ({
        value: importer.name.replaceAll(" ", "-").toLowerCase(),
        label: importer.name,
    }));
    const navigate = useNavigate();
    const matches = useMatches();

    return (
        <>
            <main>
                <Select
                    // aria-live="polite"
                    placeholder="Select importer"
                    options={options}
                    defaultValue={
                        matches
                            .filter(
                                (match) =>
                                    match.handle && match.handle.importer,
                            )
                            .map((match, index) => ({
                                value: match.handle.importer.name
                                    .replaceAll(" ", "-")
                                    .toLowerCase(),
                                label: match.handle.importer.name,
                            }))[0]
                    }
                    onChange={(option) => navigate(`/import/${option?.value}`)}
                ></Select>
                <Outlet />
            </main>
        </>
    );
}
