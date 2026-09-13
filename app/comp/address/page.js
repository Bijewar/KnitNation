"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Label } from "@/app/comp/address/ui/label";
import { onAuthStateChange } from "../../../supabase";
import { saveOrderToSupabase } from "../../../stores";

import { Input } from "@/app/comp/address/ui/input";
import css from "../../../style/address.css";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/comp/address/ui/select";
import { Button } from "@/app/comp/address/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/comp/address/ui/card";
import { Separator } from "@/app/comp/address/ui/separator";
import hoc from '../../hoc';
import { clearCart } from '../../../redux/slices';
import Header from '../Header';
import Footer from '../Footer';
import { MapPin, Tag, ShieldCheck } from "lucide-react";

function Component() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [discount, setDiscount] = useState(0); // State to store the discount amount
  const [user, setUser] = useState(null);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((n, item) => n + item.quantity, 0);

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
    // Track auth state for the header (display only)
    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

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
      alert('Razorpay SDK is not loaded yet. Please wait a moment.');
      return;
    }

    try {
      const userId = user?.id || `guest_${Date.now()}`;
      const userEmail = user?.email || (address.name ? `${address.name.replace(/\s+/g, '').toLowerCase()}@knitnation.com` : 'customer@knitnation.com');
      const userName = address.name || user?.user_metadata?.full_name || 'Customer';
      const userPhone = address.zip || '9999999999';

      const finalAmount = Math.max(1, cartTotal - discount);

      const response = await fetch('/api/startpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderDetails: {
            amount: finalAmount,
          },
          userDetails: {
            userId: userId,
            email: userEmail,
            phoneNumber: userPhone,
            fullName: userName,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to create payment order');
      }

      const data = await response.json();

      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Knit Nations',
        description: 'Order Payment',
        order_id: data.orderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        handler: async function (paymentResponse) {
          console.log('Payment successful:', paymentResponse);
          try {
            await saveOrderToSupabase({
              orderId: data.orderId,
              userId: userId,
              total: finalAmount,
              items: cartItems,
              address: address,
              status: 'Confirmed',
            });
            console.log('Order saved to Supabase successfully');
          } catch (orderErr) {
            console.error('Error saving order to Supabase:', orderErr);
          }

          // Clear the cart
          dispatch(clearCart());
          // Redirect to order success page
          router.push(`/order-success?orderId=${data.orderId}&amount=${data.amount}&currency=${data.currency || 'INR'}`);
        },
        theme: {
          color: '#FF3F6C',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert(error.message || 'Payment initiation failed');
    }
  };

  const handleAccClick = () => {
    if (user) {
      // Header manages its own account dropdown panel
    } else {
      router.push('/login');
    }
  };

  const handleCartClick = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header user={user} onAccountClick={handleAccClick} onCartClick={handleCartClick} />

      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="mb-8">
            <h1 className="text-lg lg:text-xl font-bold text-[#282c3f] uppercase tracking-wide">
              Checkout
            </h1>
            <p className="text-sm text-[#5a5d68] mt-1">
              Enter your address and apply any promo codes to complete your order.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* ============ Left: address form ============ */}
            <div className="bg-white rounded-xl border border-[#eaeaec] p-5 lg:p-7">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#eaeaec]">
                <MapPin className="w-4 h-4 text-[#ff3f6c]" />
                <h2 className="address-section-title">Add Delivery Address</h2>
              </div>
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

            {/* ============ Right: promo + sticky order summary ============ */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#eaeaec] p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-[#ff3f6c]" />
                  <h2 className="address-section-title">Apply Promo Code</h2>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Enter promo code"
                  />
                  <Button onClick={applyPromoCode} className="bg-[#ff3f6c] hover:bg-[#e6345e]">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Sticky price summary (desktop) */}
              <Card className="lg:sticky lg:top-24 border-[#eaeaec] shadow-card">
                <CardHeader>
                  <CardTitle className="address-section-title">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {cartItems.length > 0 && (
                    <>
                      <div className="flex items-center justify-between text-sm text-[#5a5d68]">
                        <span>
                          {totalItems} {totalItems === 1 ? 'item' : 'items'} in bag
                        </span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2 bg-[#eaeaec]" />
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Discount (DISCOUNT10)</span>
                      <span className="text-[#1a9c3e] font-bold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span className="text-[#1a9c3e] font-bold text-sm">FREE</span>
                  </div>
                  <Separator className="my-2 bg-[#eaeaec]" />
                  <div className="flex items-center justify-between font-bold text-[#282c3f] text-base">
                    <span>Total Amount</span>
                    <span>₹{(cartTotal - discount).toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!isRazorpayLoaded}
                    className="w-full mt-4 bg-[#ff3f6c] hover:bg-[#e6345e] font-bold uppercase tracking-wide py-6"
                  >
                    {isRazorpayLoaded ? "Place Order" : "Loading Razorpay..."}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-[#94969f]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Safe and secure payments via Razorpay</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky place-order bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#eaeaec] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-col flex-shrink-0">
            <span className="text-base font-bold text-[#282c3f]">
              ₹{(cartTotal - discount).toFixed(2)}
            </span>
            <span className="text-[10px] text-[#94969f] uppercase">
              Total Amount
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={!isRazorpayLoaded}
            className="myntra-btn flex-1 py-3 text-sm"
          >
            {isRazorpayLoaded ? "Place Order" : "Loading..."}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default hoc(Component);
