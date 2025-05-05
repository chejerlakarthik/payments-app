import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';
import { logger } from './logger';
import { querySchema } from "./paymentSchema";
import {query} from "winston";

/**
 * 
 * @param event - The API Gateway event containing the request data.
 * @param event.queryStringParameters - The query string parameters from the request.
 * @returns 
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryStringParameters = event.queryStringParameters || {};
    const validQueryParams = querySchema.safeParse(queryStringParameters);

    if (!validQueryParams.success) {
        return buildResponse(400, { error: validQueryParams.error.issues });
    } else {
        logger.debug('Listing all payments for currency ' + validQueryParams.data.currency);
        try {
            const payments = await listPayments(validQueryParams.data.currency);
            return buildResponse(200, { data: payments });
        } catch (error: any) {
            logger.error(`Error listing payments: ${error.message}`);
            return buildResponse(500, { error: `An error occurred while retrieving the payments` });
        }
    }
};
