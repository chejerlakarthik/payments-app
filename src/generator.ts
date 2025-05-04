import { randomUUID } from 'crypto';

export const generatePaymentId = (): string => {
    return randomUUID();
};