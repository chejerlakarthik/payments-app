import { generatePaymentId } from '../src/generator';

describe('PaymentId generator', () => {
    it('should generate a valid UUID', () => {
        const paymentId = generatePaymentId();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        expect(paymentId).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs on multiple calls', () => {
        const paymentId1 = generatePaymentId();
        const paymentId2 = generatePaymentId();

        expect(paymentId1).not.toBe(paymentId2);
    });
});