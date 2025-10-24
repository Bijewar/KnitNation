import { NextResponse } from 'next/server';
import { Cashfree } from "cashfree-pg";

Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Change to PRODUCTION for live environment

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    console.log('Order payments fetched:', response.data);

    let orderStatus;
    if (response.data.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
      orderStatus = "Success";
    } else if (response.data.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
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