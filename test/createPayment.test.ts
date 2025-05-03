import * as payments from '../src/lib/payments';
import * as generator from '../src/generator';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user creates a new payment', () => {

    it('Returns a 201 response with the payment ID', async () => {it
        const mockPayment = {
            amount: 100,
            currency: 'USD',
        };

        const generatedId = '57d7e3dd-9de5-4c4e-9239-8ccfa54f6f50';
        jest.spyOn(generator, 'generatePaymentId').mockReturnValue(generatedId);
        
        const paymentWithGenId = { ...mockPayment, id: generatedId };

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
        expect(JSON.parse(result.body)).toEqual({ error: 'Currency should be 3 characters long' });
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
        expect(JSON.parse(result.body)).toEqual({ error: 'Currency should be 3 characters long' });
    });

    it('Returns a 422 response if the payment request body is empty', async () => {
        const event = {
            body: '',
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Payment amount is required, Payment currency is required' });
    });

    it('Returns a 422 response if the payment currency length is not 3 characters', async () => {
        const event = {
            body: JSON.stringify({
                amount: 100,
                currency: 'US',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ error: 'Currency should be 3 characters long' });
    });
});