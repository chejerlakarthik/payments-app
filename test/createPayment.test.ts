import * as payments from '../src/lib/payments';
import * as generator from '../src/generator';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user creates a new payment', () => {

    it('Returns a 201 response with the payment ID', async () => {
        const mockPayment = {
            amount: 100,
            currency: 'USD',
        };

        const generatedId = '57d7e3dd-9de5-4c4e-9239-8ccfa54f6f50';
        jest.spyOn(generator, 'generatePaymentId').mockReturnValue(generatedId);
        
        const paymentWithGenId = { ...mockPayment, paymentId: generatedId };

        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockImplementationOnce(async (payment) => {
            expect(payment).toEqual(paymentWithGenId);
            return Promise.resolve();
        });

        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: 'USD',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body)).toEqual({ result: generatedId });
        expect(createPaymentMock).toHaveBeenCalledWith(paymentWithGenId);
    });

    it('Returns a 500 response when an unknown error occurs', async () => {
        const mockPayment = {
            amount: 100,
            currency: 'USD',
        };

        const generatedId = '57d7e3dd-9de5-4c4e-9239-8ccfa54f6f50';
        jest.spyOn(generator, 'generatePaymentId').mockReturnValue(generatedId);
        
        const paymentWithGenId = { ...mockPayment, paymentId: generatedId };

        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockImplementationOnce(async (payment) => {
            expect(payment).toEqual(paymentWithGenId);
            return Promise.reject(new Error('Database error'));
        });

        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: 'USD',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ error: `Failed to create payment - ${generatedId}. Please try again later.` });
        expect(createPaymentMock).toHaveBeenCalledWith(paymentWithGenId);
    });

    it('Returns a 422 response if the payload is invalid JSON', async () => {
        const event = {
            body: 'amount=100&currency=USD',
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment amount is required, Invalid or unsupported currency' });
    });

    it('Returns a 422 response if the payment amount is <= 0', async () => {
        const event = {
            body: JSON.stringify({
                amount: -100,
                currency: 'USD',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment amount must be >= 0' });
    });

    it('Returns a 422 response if the payment currency is blank', async () => {
        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: '',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Invalid or unsupported currency' });
    });

    it('Returns a 422 response if the payment amount is missing', async () => {
        const event = {
            body: JSON.stringify({
                currency: 'USD',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment amount is required' });
    });

    it('Returns a 422 response if the payment currency is in an invalid format', async () => {
        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: 'us dollar',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Invalid or unsupported currency' });
    });

    it('Returns a 422 response if the payment request body is empty', async () => {
        const event = {
            body: '',
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment amount is required, Invalid or unsupported currency' });
    });

    it('Returns a 422 response if the payment currency is not supported', async () => {
        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: 'AED',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Invalid or unsupported currency' });
    });
});

afterEach(() => {
    jest.resetAllMocks();
});