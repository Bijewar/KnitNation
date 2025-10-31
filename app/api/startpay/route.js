import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
  console.log('POST request received in /api/startpay');

  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
  console.log('RAZORPAY_KEY_SECRET is set:', !!process.env.RAZORPAY_KEY_SECRET);
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { orderDetails, userDetails } = await request.json();
    console.log('Order details:', orderDetails);
    console.log('User details:', userDetails);

    if (!userDetails) {
      throw new Error('User details not provided');
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      amount: orderDetails.amount * 100, // Razorpay expects amount in paisa
      currency: "INR",
      receipt: orderId,
      notes: {
        userId: userDetails.userId,
        email: userDetails.email,
        phone: userDetails.phoneNumber,
        name: userDetails.fullName
      }
    };

    console.log('Order data sent to Razorpay:', orderData);

    const order = await razorpay.orders.create(orderData);

    console.log('Razorpay response:', order);

    if (order && order.id) {
      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }, { status: 200 });
    } else {
      throw new Error('Failed to create order: No order ID in response');
    }
  } catch (error) {
    console.error('Error in startpay handler:', error);
    return NextResponse.json({
      error: 'Failed to create payment order',
      details: error.message
    }, { status: 500 });
  }
}
