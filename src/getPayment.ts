import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const paymentId = event.pathParameters?.id;
    if (!paymentId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Payment ID is required' }),
        };
    }
    
    const payment = await getPayment(paymentId);
    
    if (!payment) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: `Payment not found for paymentId: ${paymentId}` }),
        };
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify(payment),
        headers: {
            'Content-Type': 'application/json'
        }
    }
};
