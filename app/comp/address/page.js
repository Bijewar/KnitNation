"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Label } from "@/app/comp/address/ui/label";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Adjust the import path as needed

import { Input } from "@/app/comp/address/ui/input";
import css from "../../../style/address.css";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/comp/address/ui/select";
import { Button } from "@/app/comp/address/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/comp/address/ui/card";
import { Separator } from "@/app/comp/address/ui/separator";
import hoc from '../../hoc';

function Component() {
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);
  const [discount, setDiscount] = useState(0); // State to store the discount amount

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const [address, setAddress] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpaySDK = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) {
          setIsRazorpayLoaded(true);
        } else {
          console.error('Razorpay SDK loaded but Razorpay object not found');
        }
      };
      document.body.appendChild(script);
    };

    loadRazorpaySDK();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };
  const applyPromoCode = () => {
    if (promoCode === 'DISCOUNT10') {
      const discountAmount = cartTotal * 0.1; // Calculate 10% discount
      setDiscount(discountAmount);
    } else {
      // Handle invalid promo code, maybe show an error message
      alert('Invalid promo code'); 
    }
  };


  const handleCountryChange = (value) => {
    setAddress({ ...address, country: value });
  };

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
  };

 const handlePlaceOrder = async () => {
  console.log('Address:', address);
  console.log('Promo Code:', promoCode);

  if (!isRazorpayLoaded) {
    console.error('Razorpay SDK is not loaded yet. Please try again in a moment.');
    return;
  }

  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently logged in.');
    }

    // Fetch user details from Firestore
    const userDetails = await getUserDetails(currentUser.uid);

    if (!userDetails) {
      throw new Error('Unable to fetch user details.');
    }

    const response = await fetch('/api/startpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderDetails: {
          amount: cartTotal,
          // Add any other order details you need
        },
        userDetails: {
          userId: currentUser.uid,
          email: userDetails.email,
          phoneNumber: userDetails.phoneNumber,
          fullName: userDetails.fullName
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    const data = await response.json();

    if (data.orderId) {
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Knit Nations',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: function (response) {
          console.log('Payment successful:', response);
          verifyPayment(data.orderId);
          // Save order to Firestore
          saveOrderToFirestore(data.orderId, cartItems, cartTotal, userDetails);
          // Redirect to success page or handle success
          router.push('/order-success');
        },
        prefill: {
          name: userDetails.fullName,
          email: userDetails.email,
          contact: userDetails.phoneNumber,
        },
        theme: {
          color: '#000',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      throw new Error('Failed to create payment order');
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    // Handle the error (e.g., show an error message to the user)
  }
};

// Function to get user details from Firestore
async function getUserDetails(userId) {
  try {
    const usersCollection = collection(db, 'users');
    const userQuery = query(usersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName
      };
    } else {
      throw new Error('User not found in Firestore.');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

  const verifyPayment = async (orderId) => {
    try {
      const response = await fetch(`/api/verify-payment?orderId=${orderId}`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        console.log('Payment successful');
      } else {
        console.log('Payment not successful:', data.status);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  // Function to save order to Firestore
  const saveOrderToFirestore = async (orderId, items, total, userDetails) => {
    try {
      const ordersCollection = collection(db, 'orders');
      await addDoc(ordersCollection, {
        orderId: orderId,
        userId: userDetails.userId,
        items: items,
        total: total,
        status: 'Processing',
        paymentMethod: 'Razorpay',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Order saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
    }
  };

  return (
<div className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="text-muted-foreground">
        Enter your address and apply any promo codes to complete your order.
      </p>
    </div>
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={address.name}
              onChange={handleInputChange}
              placeholder="John Doe"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={address.address1}
              onChange={handleInputChange}
              placeholder="123 Main St"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={address.address2}
              onChange={handleInputChange}
              placeholder="Apt 456"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={handleInputChange}
              placeholder="San Francisco"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={address.state}
                onChange={handleInputChange}
                placeholder="CA"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">Zip Code</Label>
              <Input
                id="zip"
                value={address.zip}
                onChange={handleInputChange}
                placeholder="94103"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              value={address.country}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem   
 value="ca">Canada</SelectItem>
                <SelectItem value="mx">Mexico</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="promo-code">Promo Code</Label>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              value={promoCode}
              onChange={handlePromoCodeChange}
              placeholder="Enter promo code"
            />
            <Button onClick={applyPromoCode}>Apply</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && ( 
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span className="text-green-500">-${discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>${(cartTotal - discount).toFixed(2)}</span> 
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <div className="mt-8 flex justify-end">
      <Button onClick={handlePlaceOrder} disabled={!isRazorpayLoaded}>
        {isRazorpayLoaded ? "Place Order" : "Loading Razorpay..."}
      </Button>
    </div>
  </div>
  );
}

export default hoc(Component);