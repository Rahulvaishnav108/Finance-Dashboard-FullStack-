import { apiClient } from '../../../shared/services/apiClient';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CustomerPaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'ONLINE';

export type CreateCustomerPaymentResponse = {
  billId: string;
  paymentIntentId: string;
  paymentId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayKeyId: string | null;
  provider: 'razorpay' | 'mock' | string;
  payment?: {
    _id?: string;
    id?: string;
    amount?: number;
    method?: CustomerPaymentMethod;
    status?: string;
    providerPaymentId?: string | null;
    razorpayOrderId?: string | null;
  } | null;
};

export type VerifyCustomerPaymentInput = {
  paymentId: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  simulateStatus?: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
};

export type VerifyCustomerPaymentResponse = {
  bill: unknown;
  payment: unknown;
};

export async function createCustomerPayment(paymentMethod: CustomerPaymentMethod) {
  const response = await apiClient.post<ApiResponse<CreateCustomerPaymentResponse>>('/payments/customer/create', {
    paymentMethod,
  });

  return response.data.data;
}

export async function verifyCustomerPayment(input: VerifyCustomerPaymentInput) {
  const response = await apiClient.post<ApiResponse<VerifyCustomerPaymentResponse>>(
    '/payments/customer/verify',
    input,
  );

  return response.data.data;
}
