import { z } from 'zod';

/**
 * Schema for validating payment requests. The error messages are customized for each field to be more meaningful 
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
    
    currency: z.string({ required_error: "Payment currency is required" })
    .min(3, { message: "Currency should be 3 characters long" })
    .max(3, { message: "Currency should be 3 characters long" }),
});