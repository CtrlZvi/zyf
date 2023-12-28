 # zyf
 A personal financial tracker with an emphasis on anticipatory cashflow

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Updating the database schema

To update the database schema, first ensure that the new schema is recorded in
a schema.ts file. Then run `npx drizzle-kit gnerate:sqlite`. Lastly, restart
the Next.js server as migrations only run on cold start.

## Where does the name come from?

I decided I wanted to spend a year focusing on my finance's and putting myself
into a financially healthy state where I was no longer living paycheck to
paycheck. When I looked at tools available to help me track my spending and
plan my budgets, all of them were missing key features or had user experiences
that didn't align well with what I was looking for. I decided to build my own
project, but what to call it?

Originally, I had intended to call the project MIMO, for Money In, Money Out
(inspired by [GIGO][garbage in, garbage out] for Garbage In Garbage Out). I
found there was a type of pterosaur called a [mimodactylus][mimodactylus] that
I could use for the logo. That piece of history still exists as the logo
continues to be (planned to be) a mimodactylus.

To make a year where I was going to be spending less, eating out less, etc.
more fun for me, I decided to give it a (relatively) fun name: Zvi's Year of
Frugality, which immediately became shortened to ZYF, pronounced zif (IPA:zɪɸ).
I decided that made for a much better name than MIMO as it was less likely to
collide[^collide] and was a little bit more fun to say.

[^collide]: Despite being less likely to collide, it appears that there is
package name collision. This is resolved by appending "-finance" to the package
name, though the project is still just ZYF.

[garbage in, garbage out]: https://en.wikipedia.org/wiki/Garbage_in%2C_garbage_out
[mimodactylus]: https://en.wikipedia.org/wiki/Mimodactylus