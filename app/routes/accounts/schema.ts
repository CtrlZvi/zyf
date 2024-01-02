import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const accountTypes = [
    "cash",
    "savings",
    "checking",
    "loan",
    "payment card",
    "merchant",
    "person",
] as const;

const zodURL = z.custom<URL>((value) => value instanceof URL);

const account = z
    .object({
        id: z.number().int(),
        name: z.string().min(1),
        type: z.enum(accountTypes),
        internal: z.boolean(),
        url: zodURL.optional(),
        icon: z.string().min(1).optional(),
    })
    .strict();
export type Account = z.infer<typeof account>;

function makeDatabaseReadSchema<T extends z.AnyZodObject>(schema: T) {
    const entries = Object.entries(schema.shape) as [
        keyof T["shape"],
        z.ZodTypeAny,
    ][];
    const properties = entries.reduce(
        (properties, [key, value]) => {
            properties[key] =
                value instanceof z.ZodOptional
                    ? value
                          .unwrap()
                          .nullable()
                          .transform((value: unknown) =>
                              value === null ? undefined : value,
                          )
                          .optional()
                    : value;
            return properties;
        },
        {} as {
            [key in keyof T["shape"]]: T["shape"][key];
        },
    );
    return z.object(properties);
}
export const accountDatabaseReadParser = makeDatabaseReadSchema(
    account.extend({
        url: z
            .string()
            .url()
            .transform((url) => new URL(url))
            .optional(),
    }),
);
// TODO (zeffron 2024-01-01) Linters are causing grief over
// ValidateCreateAccountData being unused, so this is commented out for now and
// can be uncommented when making changes to perform validation until I can
// figure out how to make the linters happy. ESLint inline comments don't seem
// to do it, and ts seems to also be sad and I don't think it respects the
// eslint inline comments.
// type TypesAreEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
// type StaticAssert<T extends true> = T;
// type ValidateCreateAccountData = StaticAssert<
//     TypesAreEqual<
//         z.output<typeof accountDatabaseReadParser>,
//         z.infer<typeof account>
//     >
// >;

export const accountFromJSONParser = account.extend({
    url: z
        .string()
        .url()
        .transform((url) => new URL(url))
        .optional(),
});
// TODO (zeffron 2024-01-01) Linters are causing grief over
// ValidateCreateAccountData being unused, so this is commented out for now and
// can be uncommented when making changes to perform validation until I can
// figure out how to make the linters happy. ESLint inline comments don't seem
// to do it, and ts seems to also be sad and I don't think it respects the
// eslint inline comments.
// type TypesAreEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
// type StaticAssert<T extends true> = T;
// type ValidateCreateAccountData = StaticAssert<
//     TypesAreEqual<
//         z.output<typeof accountFromJSONParser>,
//         z.infer<typeof account>
//     >
// >;

export const createAccountFormParser = account
    .omit({ id: true, icon: true })
    .extend({
        internal: z.coerce.boolean(),
        url: z
            .string()
            .url()
            .transform((url) => new URL(url))
            .or(
                z
                    .string()
                    .max(0)
                    .transform(() => undefined),
            )
            .optional(),
    })
    .strict();
export type CreateAccountData = z.infer<typeof createAccountFormParser>;

export const createAccountDatabaseParser = account
    .omit({ id: true })
    .extend({
        url: zodURL.transform((url) => url.toString()).optional(),
    })
    .strict();
// TODO (zeffron 2024-01-01) Linters are causing grief over
// ValidateCreateAccountData being unused, so this is commented out for now and
// can be uncommented when making changes to perform validation until I can
// figure out how to make the linters happy. ESLint inline comments don't seem
// to do it, and ts seems to also be sad and I don't think it respects the
// eslint inline comments.
// type TypesAreEqual<T, U> = T extends U ? (U extends T ? true : false) : false;
// type StaticAssert<T extends true> = T;
// type ValidateCreateAccountData = StaticAssert<
//     TypesAreEqual<
//         z.output<typeof createAccountFormParser>,
//         z.input<typeof createAccountDatabaseParser>
//     >
// >;

export const accountsTable = sqliteTable(
    "accounts",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        name: text("name").notNull(),
        type: text("type", { enum: accountTypes }).notNull(),
        internal: integer("internal", { mode: "boolean" }).notNull(),
        url: text("url"),
        icon: text("icon"),
    },
    (table) => ({
        uniqueHumanIdentifier: uniqueIndex("human_identifier_idx").on(
            table.name,
            table.type,
        ),
    }),
);
