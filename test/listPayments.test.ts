import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/listPayments';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests to list all payments', () => {
    it('Returns all payments', async () => {
        const mockPayments = [
            {
                paymentId: randomUUID(),
                currency: 'AUD',
                amount: 2000,
            },
            {
                paymentId: randomUUID(),
                currency: 'USD',
                amount: 1000,   
            },
            {
                paymentId: randomUUID(),
                currency: 'USD',
                amount: 432,   
            }
        ]
        
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

        const result = await handler({} as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ data: mockPayments });
        expect(listPaymentsMock).toHaveBeenCalledWith(undefined);
    });

    it('Returns all payments for currency USD', async () => {
        const mockPayments = [
            {
                paymentId: randomUUID(),
                currency: 'USD',
                amount: 1000,   
            },
            {
                paymentId: randomUUID(),
                currency: 'USD',
                amount: 432,   
            }
        ]

        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

        const result = await handler({
            queryStringParameters: {
                currency: 'USD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual({ data: mockPayments });
        expect(listPaymentsMock).toHaveBeenCalledWith('USD');
    });

    it('Returns a 500 response when an unknown error occurs', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(
            Promise.reject(new Error('Database error'))
        );

        const result = await handler({
            queryStringParameters: {
                currency: 'USD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: `An error occurred while retrieving the payments - Error: Database error` });
        expect(listPaymentsMock).toHaveBeenCalledWith('USD');
    });
});

afterEach(() => {
    jest.resetAllMocks();
});