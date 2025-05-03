import { APIGatewayProxyResult } from 'aws-lambda';
import { logger } from '../logger';

export const buildResponse = (statusCode: number, body: Object): APIGatewayProxyResult => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};

export const parseInput = (body: string): Object => {
    try {
        return JSON.parse(body);
    } catch (err) {
        logger.error(err);
        return {};
    }
};
