'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

declare global { interface Window { Razorpay: any } }

const PLATFORM_FEE_RATE = 0.028;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [payMethod, setPayMethod] = useState<'RAZORPAY' | 'CREDIPAY'>('RAZORPAY');
  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY');
  const [addrForm, setAddrForm] = useState({ street: '', landmark: '', city: '', state: '', pincode: '' });
  const [ledger, setLedger] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [redeem, setRedeem] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = total();
  const pointsDiscount = redeem ? Math.min(subtotal, (loyalty?.loyalty_points || 0) / 10) : 0;
  const platformFee = payMethod === 'CREDIPAY' ? parseFloat((subtotal * PLATFORM_FEE_RATE).toFixed(2)) : 0;
  const deliveryFee = deliveryType === 'DELIVERY' ? 25 : 0;
  const grandTotal = parseFloat(Math.max(0, (subtotal + platformFee + deliveryFee - pointsDiscount)).toFixed(2));

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'CUSTOMER') {
      api.get('/credipay/ledger').then(r => setLedger(r.data)).catch(() => {});
      api.get('/loyalty/me').then(r => setLoyalty(r.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (payMethod === 'RAZORPAY') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, [payMethod]);

  const placeOrder = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (deliveryType === 'DELIVERY' && (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.pincode)) { 
      toast.error('Please complete all address fields'); return; 
    }
    if (payMethod === 'CREDIPAY' && ledger && ledger.available_credit < grandTotal) {
      toast.error(`Insufficient CrediPay credit. Available: ₹${ledger.available_credit}`); return;
    }

    setPlacing(true);
    try {
      const fullAddress = deliveryType === 'DELIVERY' 
        ? `${addrForm.street}, ${addrForm.landmark ? addrForm.landmark + ', ' : ''}${addrForm.city}, ${addrForm.state} - ${addrForm.pincode}`
        : 'Self pickup';

      const orderPayload = {
        shop_id: items[0].shop_id,
        items: items.map(i => ({ product_id: i.product_id, qty: i.qty })),
        payment_method: payMethod,
        delivery_type: deliveryType,
        address: fullAddress,
        redeem_points: redeem ? Math.min(loyalty?.loyalty_points || 0, Math.floor(subtotal * 10)) : 0,
      };

      const { data } = await api.post('/orders', orderPayload);

      if (payMethod === 'RAZORPAY') {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          order_id: data.razorpay_order_id,
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'CrediKart',
          description: `Order #${data.order_id}`,
          handler: async (response: any) => {
            await api.post('/orders/verify-payment', {
              order_id: data.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Order placed successfully!');
            router.push(`/dashboard/orders`);
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#f59e0b' },
        });
        rzp.open();
      } else {
        clearCart();
        toast.success('Order placed on CrediPay!');
        router.push(`/dashboard/orders`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
        <div className="text-6xl">🛒</div>
        <p>Your cart is empty</p>
        <button onClick={() => router.push('/')} className="btn-primary">Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left - Options */}
          <div className="lg:col-span-3 space-y-5">
            {/* Delivery type */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Delivery Option</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['DELIVERY', 'PICKUP'] as const).map(t => (
                  <button key={t} onClick={() => setDeliveryType(t)}
                    className={`p-4 rounded-xl border text-center transition-all ${deliveryType === t ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="text-2xl mb-1">{t === 'DELIVERY' ? '🚴' : '🏪'}</div>
                    <div className="text-sm font-semibold text-gray-900">{t === 'DELIVERY' ? 'Home Delivery' : 'Self Pickup'}</div>
                    <div className="text-xs text-gray-500">{t === 'DELIVERY' ? '+₹25 fee' : 'Free'}</div>
                  </button>
                ))}
              </div>
              {deliveryType === 'DELIVERY' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="label">Street Address / House No.</label>
                    <input type="text" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} className="input" placeholder="e.g. 123, Sunrise Apartments" />
                  </div>
                  <div>
                    <label className="label">Landmark (Optional)</label>
                    <input type="text" value={addrForm.landmark} onChange={e => setAddrForm({...addrForm, landmark: e.target.value})} className="input" placeholder="e.g. Near City Mall" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input type="text" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} className="input" placeholder="e.g. Mumbai" />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input type="text" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} className="input" placeholder="e.g. Maharashtra" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input type="text" value={addrForm.pincode} onChange={e => setAddrForm({...addrForm, pincode: e.target.value})} className="input" placeholder="e.g. 400001" maxLength={6} />
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <button onClick={() => setPayMethod('RAZORPAY')}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${payMethod === 'RAZORPAY' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="text-2xl">💳</div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Razorpay</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking – Instant payment</p>
                  </div>
                  {payMethod === 'RAZORPAY' && <span className="ml-auto text-brand-500 font-bold">✓</span>}
                </button>

                <button onClick={() => setPayMethod('CREDIPAY')}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${payMethod === 'CREDIPAY' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="text-2xl">🪙</div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">CrediPay</p>
                    <p className="text-xs text-gray-500">Buy now, pay within 7 days. 2.8% fee applies.</p>
                    {ledger && (
                      <p className="text-xs text-green-600 mt-0.5">Available: ₹{Number(ledger.available_credit).toFixed(0)}</p>
                    )}
                  </div>
                  {payMethod === 'CREDIPAY' && <span className="ml-auto text-brand-500 font-bold">✓</span>}
                </button>
              </div>
            </div>

            {/* Cart summary */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Order Items</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map(i => (
                  <div key={i.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{i.name} <span className="text-gray-400">× {i.qty}</span></span>
                    <span className="text-gray-900 font-medium">₹{(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            {loyalty?.loyalty_points > 0 && (
              <div className="card p-5 mb-5 border-2 border-brand-100 bg-brand-50/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>🏆</span> Spend Points
                  </h3>
                  <button 
                    onClick={() => setRedeem(!redeem)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${redeem ? 'bg-brand-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${redeem ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-1">You have <b>{loyalty.loyalty_points}</b> CrediPoints available.</p>
                <p className="text-xs font-semibold text-brand-700">
                  {redeem ? `Using points to save ₹${pointsDiscount.toFixed(2)}` : `Redeem to save up to ₹${Math.min(subtotal, loyalty.loyalty_points / 10).toFixed(0)}`}
                </p>
              </div>
            )}

            <div className="card p-5 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                {platformFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>CrediPay fee (2.8%)</span>
                    <span className="text-orange-600">+₹{platformFee.toFixed(2)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Delivery</span><span>+₹{deliveryFee}</span></div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Loyalty Discount</span>
                    <span>-₹{pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-900 font-bold text-base">
                  <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {payMethod === 'CREDIPAY' && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                  <p className="font-semibold mb-1">CrediPay Terms</p>
                  <p>Pay within 7 days to avoid extra interest. After 7 days, 0.5%/week is charged on the outstanding balance.</p>
                </div>
              )}

              <button onClick={placeOrder} disabled={placing} className="btn-primary w-full py-3 text-base">
                {placing ? 'Placing order...' : `Place Order • ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
