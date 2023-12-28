import type { Metadata } from 'next'

import Navigation from "@/components/navigation"
import './globals.css'

export const metadata: Metadata = {
    title: 'ZYF',
}

export default function RootLayout({
    children,
    sidebar,
}: {
    children: React.ReactNode,
    sidebar: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Navigation />
                <main>
                    {children}
                </main>
                {sidebar}
            </body>
        </html>
    )
}