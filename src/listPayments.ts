import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';
import { logger } from './logger';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const searchCurrency = event.queryStringParameters?.currency;

    try {
        const payments = await listPayments(searchCurrency);
        return buildResponse(200, { data: payments });
    } catch (error) {
        logger.error(`Error listing payments: ${error}`);
        return buildResponse(500, { error: `An error occurred while retrieving the payments - ${error}` });
    }
};
