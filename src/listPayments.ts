import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';
import { logger } from './logger';
import { currencySchema } from "./paymentSchema";

/**
 * 
 * @param event - The API Gateway event containing the request data.
 * @param event.queryStringParameters - The query string parameters from the request.
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const searchCurrency = event.queryStringParameters?.currency;

    const validatedCurrency = currencySchema.safeParse(searchCurrency)

    if (!validatedCurrency.success) {
        return buildResponse(400, { error: validatedCurrency.error.message });
    } else {
        try {
            const payments = await listPayments(searchCurrency);
            return buildResponse(200, { data: payments });
        } catch (error: any) {
            logger.error(`Error listing payments: ${error.message}`);
            return buildResponse(500, { error: `An error occurred while retrieving the payments` });
        }
    }
};
