import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const order = await razorpay.orders.fetch(orderId);
    console.log('Order fetched:', order);

    let orderStatus;
    if (order.status === 'paid') {
      orderStatus = "Success";
    } else if (order.status === 'attempted') {
      orderStatus = "Pending";
    } else {
      orderStatus = "Failure";
    }

    return NextResponse.json({ status: orderStatus }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ error: 'Failed to fetch payment status', details: error.message }, { status: 500 });
  }
}
