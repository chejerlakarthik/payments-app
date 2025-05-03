import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';
import { logger } from './logger';
import { error } from 'console';

/**
 * This function handles all requests to GET /payments/{id} endpoint.
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentId = event.pathParameters?.id;
    if (!paymentId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Payment ID is required' }),
        };
    }
    
    try {
        const payment = await getPayment(paymentId);
        
        // If the payment is not found in DynamoDB, return a 404 error.
        if (!payment) {
            const errorMessage = `Payment not found for paymentId: ${paymentId}`;
            logger.error(errorMessage);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: errorMessage }),
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(payment),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An error occurred while retrieving the payment - ${paymentId}` }),
        };
    }
};
