import { z } from 'zod';

/**
 * Schema to validate currency inputs. Including a few currencies only for illustration.
 */
const currencySchema = z.enum(["USD", "EUR", "GBP", "AUD", "INR"], {
    required_error: "Currency is required",
    message: "Invalid or unsupported currency"
});

export const querySchema = z.object({
    currency: currencySchema.optional(),
});

/**
 * Schema for validating payment requests. The error messages are customized for each field 
 * to be more meaningful 
 * in the context of the application.
 * @param {string} id - The unique identifier for the payment (optional).
 * @param {number} amount - The amount of the payment (required).
 * @param {string} currency - The currency of the payment (required).
 * @returns {z.ZodObject} - A Zod schema object for validating payment requests.
 */
export const paymentSchema = z.object({
    id: z.string()
    .optional(),
    
    amount: z.number({ required_error: "Payment amount is required" })
    .positive({ message: "Payment amount must be >= 0" }),

    currency: currencySchema
});