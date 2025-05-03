import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment, Payment, PaymentRequest } from './lib/payments';
import { generatePaymentId } from './generator';
import { paymentSchema } from './paymentSchema';
import { Schema, ZodError } from 'zod';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentRequest = parseInput(event.body || '{}') as PaymentRequest;

    try {
        paymentSchema.parse(paymentRequest);
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessage = error.errors.map((e) => e.message).join(', ');
            return buildResponse(422, { error: errorMessage });
        }
    }

    // Generate a unique ID for the payment.
    const paymentId = generatePaymentId();

    const payment: Payment = {
        id: paymentId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
    };
    
    await createPayment(payment);
    return buildResponse(201, { result: payment.id });
};
