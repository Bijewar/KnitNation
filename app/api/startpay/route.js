import { NextResponse } from 'next/server';
import { Cashfree } from "cashfree-pg";

export async function POST(request) {
  console.log('POST request received in /api/startpay');

  console.log('NEXT_PUBLIC_CASHFREE_CLIENT_ID:', process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID);
  console.log('CASHFREE_CLIENT_SECRET is set:', !!process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET);
  console.log('NEXT_PUBLIC_CASHFREE_MODE:', process.env.NEXT_PUBLIC_CASHFREE_MODE);
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  try {
    Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
    Cashfree.XClientSecret = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;
    Cashfree.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'SANDBOX'
      ? Cashfree.Environment.SANDBOX
      : Cashfree.Environment.PRODUCTION;

    const { orderDetails, userDetails } = await request.json();
    console.log('Order details:', orderDetails);
    console.log('User details:', userDetails);

    if (!userDetails) {
      throw new Error('User details not provided');
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      order_amount: orderDetails.amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userDetails.userId,
        customer_email: userDetails.email,
        customer_phone: userDetails.phoneNumber,
        customer_name: userDetails.fullName
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/handle-payment-response?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cashfree-webhook`
      }
    };

    console.log('Order data sent to Cashfree:', orderData);

    const response = await Cashfree.PGCreateOrder("2022-09-01", orderData);

    console.log('Cashfree response:', response.data);

    if (response.data && response.data.payment_session_id) {
      return NextResponse.json({
        paymentSessionId: response.data.payment_session_id,
        orderId: orderId
      }, { status: 200 });
    } else {
      throw new Error('Failed to create payment session: No payment_session_id in response');
    }
  } catch (error) {
    console.error('Error in startpay handler:', error);
    console.error('Error response:', error.response ? error.response.data : 'No response data');
    return NextResponse.json({
      error: 'Failed to create payment session',
      details: error.message,
      responseData: error.response ? error.response.data : 'No response data'
    }, { status: 500 });
  }
}