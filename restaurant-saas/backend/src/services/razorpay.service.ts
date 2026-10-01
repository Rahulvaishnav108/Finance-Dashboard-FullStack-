// src/services/razorpay.service.ts
// Isolated Razorpay client — all SDK calls go through here.
// The rest of the app never imports razorpay directly.

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants/errors';

/*
|--------------------------------------------------------------------------
| Client — lazy singleton so app starts fine even without keys
|--------------------------------------------------------------------------
*/

let _client: Razorpay | null = null;

function getClient(): Razorpay {
  if (_client) return _client;

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new AppError(
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      500,
      ErrorCode.INTERNAL_ERROR,
    );
  }

  _client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _client;
}

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export interface RazorpayOrderOptions {
  amount: number;        // in paise (₹1 = 100 paise)
  currency?: string;     // default INR
  receipt: string;       // your internal reference e.g. bill ID
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;            // rzp_order_id — send to frontend
  amount: number;        // in paise
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/*
|--------------------------------------------------------------------------
| Create Order
| Called when customer initiates payment.
| Returns an order object — frontend uses this to open Razorpay checkout.
|--------------------------------------------------------------------------
*/

export async function createRazorpayOrder(
  options: RazorpayOrderOptions,
): Promise<RazorpayOrderResult> {
  const client = getClient();

  const order = await client.orders.create({
    amount: Math.round(options.amount * 100), // convert ₹ to paise
    currency: options.currency ?? 'INR',
    receipt: options.receipt,
    notes: options.notes ?? {},
  });

  return {
    id: order.id,
    amount: order.amount as number,
    currency: order.currency,
    receipt: order.receipt ?? options.receipt,
    status: order.status,
  };
}

/*
|--------------------------------------------------------------------------
| Verify Signature
| Called after customer completes payment on frontend.
| Razorpay sends razorpay_order_id + razorpay_payment_id + razorpay_signature.
| We verify the signature using HMAC-SHA256.
|--------------------------------------------------------------------------
*/

export function verifyRazorpaySignature(input: RazorpayVerifyInput): boolean {
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new AppError(
      'Razorpay key secret is not configured',
      500,
      ErrorCode.INTERNAL_ERROR,
    );
  }

  // Razorpay signature = HMAC-SHA256( orderId + "|" + paymentId, keySecret )
  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === input.razorpay_signature;
}

/*
|--------------------------------------------------------------------------
| Verify Webhook Signature
| Called by the webhook handler to validate the request came from Razorpay.
|--------------------------------------------------------------------------
*/

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

/*
|--------------------------------------------------------------------------
| Fetch Payment Details from Razorpay (optional — for extra validation)
|--------------------------------------------------------------------------
*/

export async function fetchRazorpayPayment(razorpayPaymentId: string) {
  const client = getClient();
  return client.payments.fetch(razorpayPaymentId);
}

/*
|--------------------------------------------------------------------------
| Refund
|--------------------------------------------------------------------------
*/

export async function createRazorpayRefund(
  razorpayPaymentId: string,
  amountInRupees: number,
  notes?: Record<string, string>,
) {
  const client = getClient();

  const refund = await client.payments.refund(razorpayPaymentId, {
    amount: Math.round(amountInRupees * 100), // convert to paise
    notes: notes ?? {},
  });

  return refund;
}
