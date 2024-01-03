# zyf

A personal financial tracker with an emphasis on anticipatory cashflow

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

-   `build/`
-   `public/build/`

## Updating the database schema

To update the database schema, first ensure that the new schema is recorded in
a schema.ts file. Then run `npx drizzle-kit generate:sqlite`. Lastly, restart
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
collide[^collide] and was a little bit more fun to say. Finally, I decided to
make it a name and not an acronym, so the end result is Zyf.

[^collide]:
    Despite being less likely to collide, it appears that there is
    package name collision. This is resolved by appending "-finance" to the package
    name, though the project is still just Zyf.

[garbage in, garbage out]: https://en.wikipedia.org/wiki/Garbage_in%2C_garbage_out
[mimodactylus]: https://en.wikipedia.org/wiki/Mimodactylus
