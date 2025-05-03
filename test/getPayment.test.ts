import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/getPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests the records for a specific payment', () => {

    it('Returns the payment matching their input parameter.', async () => {
        const paymentId = randomUUID();
        const mockPayment = {
            paymentId: paymentId,
            currency: 'AUD',
            amount: 2000,
        };
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(mockPayment);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockPayment);

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns an error when the paymentId is missing in the request', async () => {
        const result = await handler({
            pathParameters: {
                id: undefined
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment ID is required' });
    });

    it('Returns a NotFound error when the payment matching given ID could not be found', async () => {
        const paymentId = randomUUID();
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(
            Promise.resolve(null)
        );

        const result = await handler({
            pathParameters: {
                id: paymentId
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual({ error: `Payment not found for paymentId: ${paymentId}` });

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Returns 500 error when ann unknown error occurs retrieving a specific payment', async () => {
        const paymentId = randomUUID();
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(
            Promise.reject(new Error('Database error'))
        );

        const result = await handler({
            pathParameters: {
                id: paymentId
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: `An error occurred while retrieving the payment - ${paymentId}` });

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
