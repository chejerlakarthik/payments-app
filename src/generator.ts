import { v4 as uuidv4 } from 'uuid';

export const generatePaymentId = (): string => {
    return uuidv4();
};