import { z } from "zod";

/**
 * ============================================================
 * Constants
 * ============================================================
 */

const CURRENT_YEAR = new Date().getFullYear();

const ISBN_13_REGEX = /^(97[89])\d{10}$/;

/**
 * ============================================================
 * Common Validators
 * ============================================================
 */

const TitleSchema = z
    .string()
    .trim()
    .min(3, "Title is required.");

const AuthorSchema = z
    .string()
    .trim()
    .min(3, "Author name must contain at least 3 characters.")
    .max(100, "Author name cannot exceed 100 characters.");

const IsbnSchema = z
    .string()
    .trim()
    .regex(
        ISBN_13_REGEX,
        "ISBN must be a valid 13-digit ISBN (ISBN-13)."
    );

const PriceSchema = z
    .number()
    .positive("Price must be greater than zero.")
    .max(100000, "Price exceeds the allowed limit.");

const PublishedYearSchema = z
    .number()
    .int("Published year must be an integer.")
    .min(1900, "Published year cannot be before 1900.")
    .max(
        CURRENT_YEAR,
        `Published year cannot be greater than ${CURRENT_YEAR}.`
    );

/**
 * ============================================================
 * Create Book Schema
 * ============================================================
 */

export const CreateBookSchema = z.object({
    title: TitleSchema,

    author: AuthorSchema,

    isbn: IsbnSchema,

    price: PriceSchema,

    publishedYear: PublishedYearSchema.optional()
});

/**
 * ============================================================
 * Update Book Schema
 *
 * Every property is optional.
 * At least one field must be supplied.
 * ============================================================
 */

export const UpdateBookSchema = z
    .object({
        title: TitleSchema.optional(),

        author: AuthorSchema.optional(),

        isbn: IsbnSchema.optional(),

        price: PriceSchema.optional(),

        publishedYear: PublishedYearSchema.optional()
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided for update."
        }
    );

/**
 * ============================================================
 * Book ID Validation
 * ============================================================
 */

export const BookIdSchema = z.object({
    id: z.coerce
        .number()
        .int("Book ID must be an integer.")
        .positive("Book ID must be greater than zero.")
});

/**
 * ============================================================
 * Query Parameter Validation
 * ============================================================
 */

export const BookQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    sortBy: z
        .enum([
            "title",
            "author",
            "price",
            "publishedYear"
        ])
        .default("title"),

    order: z
        .enum(["asc", "desc"])
        .default("asc"),

    author: z.string().optional(),

    title: z.string().optional()
});

/**
 * ============================================================
 * DTO Types
 * ============================================================
 */

export type CreateBookDto = z.infer<typeof CreateBookSchema>;

export type UpdateBookDto = z.infer<typeof UpdateBookSchema>;

export type BookIdDto = z.infer<typeof BookIdSchema>;

export type BookQueryDto = z.infer<typeof BookQuerySchema>;