import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment, Payment, PaymentRequest } from './lib/payments';
import { generatePaymentId } from './generator';
import { paymentSchema } from './paymentSchema';
import { logger } from './logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentRequest = parseInput(event.body || '{}') as PaymentRequest;

    // Validate the payment request using Zod schema.
    const validatedPaymentRequest = paymentSchema.safeParse(paymentRequest);

    if (!validatedPaymentRequest.success) {
        const errorMessage = validatedPaymentRequest.error.errors.map((e) => e.message).join(', ');
        logger.error(`Invalid payment request ${JSON.stringify}: ${errorMessage}`);
        return buildResponse(422, { error: errorMessage });
    } else {
        // Generate a unique ID for the payment.
        const paymentId = generatePaymentId();

        const payment: Payment = {
            paymentId: paymentId, // Ignore the paymentId from the request
            amount: validatedPaymentRequest.data.amount,
            currency: validatedPaymentRequest.data.currency,
        };
        
        try {
            await createPayment(payment);
            logger.info(`Payment created: ${payment.paymentId} - ${JSON.stringify(payment)}`);
            return buildResponse(201, { result: payment.paymentId });
        } catch (error: any) {
            logger.error(`Error creating payment: ${error.message}`);
            return buildResponse(500, { error: `Failed to create payment - ${paymentId}. Please try again later.` });
        }
    }
};
