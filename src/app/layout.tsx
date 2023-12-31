// TODO (zeffron 2023-12-28) This is a workaround for the Font Awesome styles
// not being included as needed (see
// https://stackoverflow.com/questions/56334381/why-my-font-awesome-icons-are-being-displayed-big-at-first-and-then-updated-to-t,
// although in our case it wasn't too big at first, it was just too big). This
// workaround means any other parts of the code that include the icons need to
// disable the stylesheet import because otherwise we get the style potentially
// twice, once inlined. Also, this is resulting in the style being added to the
// layout style, but it would probably be better if it were its own stylesheet.
// That way we can benefit from cache behaviors _and_ exclude it on pages that
// don't use the icons.
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata } from "next";
import { StrictMode } from "react";

import Navigation from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
    title: "ZYF",
};

export default function RootLayout({
    children,
    sidebar,
}: {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) {
    return (
        <StrictMode>
            <html lang="en">
                <body>
                    <Navigation />
                    <main>{children}</main>
                    {sidebar}
                </body>
            </html>
        </StrictMode>
    );
}
