import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const PaymentsTableName = 'PaymentsTable';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: PaymentsTableName,
            Key: { paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export const listPayments = async (currency?: String): Promise<Payment[]> => {
    // If a currency is provided, filter the payments by that currency else return all payments.
    const scanCommand = currency
        ? new ScanCommand({
            TableName: PaymentsTableName,
            FilterExpression: "#currency = :currency",
            ExpressionAttributeNames: {
                "#currency": "currency",
            },
            ExpressionAttributeValues: {
                ":currency": currency,
            }
        })
        : new ScanCommand({
            TableName: PaymentsTableName
        });

    const result = await DocumentClient.send(scanCommand);

    return (result.Items as Payment[]) || [];
};

export const createPayment = async (payment: Payment) => {
    await DocumentClient.send(
        new PutCommand({
            TableName: 'PaymentsTable',
            Item: payment,
        })
    );
};

export type Payment = {
    paymentId: string;
    amount: number;
    currency: string;
};

// Create a new type without the 'paymentId' property. We want to control the ID format.
export type PaymentRequest = Omit<Payment, 'paymentId'>;
