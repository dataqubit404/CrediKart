'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  Truck, 
  Store, 
  CreditCard, 
  Wallet, 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Trophy,
  Zap,
  CheckCircle2
} from 'lucide-react';

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
          theme: { color: '#3366FF' },
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
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 text-4xl">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Checkout is empty</h2>
        <p className="text-gray-500 mb-8 max-w-xs">You haven't added any items to your cart for checkout.</p>
        <button onClick={() => router.push('/')} className="btn-premium px-10">Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-midnight transition-colors duration-500">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white tracking-tight">Secure Checkout</h1>
            </div>
            <p className="text-gray-500 font-medium ml-13">Complete your purchase with lightning speed.</p>
          </div>
          
          <div className="flex items-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Review</span>
            </div>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-black text-white">2</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Delivery Section */}
            <div className="card-premium">
              <div className="flex items-center gap-3 mb-8">
                <Truck className="w-6 h-6 text-brand-500" />
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">How should we deliver?</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {(['DELIVERY', 'PICKUP'] as const).map(t => (
                  <button key={t} onClick={() => setDeliveryType(t)}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${deliveryType === t ? 'border-brand-500 bg-brand-500/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-midnight hover:border-brand-500/30'}`}>
                    {deliveryType === t && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-brand-500" />}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${deliveryType === t ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-brand-500'}`}>
                      {t === 'DELIVERY' ? <Truck className="w-6 h-6" /> : <Store className="w-6 h-6" />}
                    </div>
                    <p className="font-display font-black text-lg text-gray-900 dark:text-white">{t === 'DELIVERY' ? 'Doorstep Delivery' : 'Self Pickup'}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{t === 'DELIVERY' ? 'Delivered in 10-15 mins • ₹25' : 'Collect from shop • FREE'}</p>
                  </button>
                ))}
              </div>

              {deliveryType === 'DELIVERY' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                      <input type="text" value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} className="input-premium" placeholder="Flat No, Building Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                      <input type="text" value={addrForm.landmark} onChange={e => setAddrForm({...addrForm, landmark: e.target.value})} className="input-premium" placeholder="Nearby point (Optional)" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input type="text" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} className="input-premium" placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <input type="text" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} className="input-premium" placeholder="State" />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <input type="text" value={addrForm.pincode} onChange={e => setAddrForm({...addrForm, pincode: e.target.value})} className="input-premium" placeholder="6 Digits" maxLength={6} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="card-premium">
              <div className="flex items-center gap-3 mb-8">
                <Wallet className="w-6 h-6 text-brand-500" />
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Choose Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                <button onClick={() => setPayMethod('RAZORPAY')}
                  className={`w-full p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all relative group ${payMethod === 'RAZORPAY' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-midnight hover:border-brand-500/30'}`}>
                  {payMethod === 'RAZORPAY' && <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-6 w-6 h-6 text-brand-500" />}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${payMethod === 'RAZORPAY' ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-brand-500'}`}>
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-black text-lg text-gray-900 dark:text-white">Razorpay Secure</p>
                    <p className="text-xs font-medium text-gray-500">Cards, UPI, NetBanking • Secure & Instant</p>
                  </div>
                </button>

                <button onClick={() => setPayMethod('CREDIPAY')}
                  className={`w-full p-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all relative group ${payMethod === 'CREDIPAY' ? 'border-brand-500 bg-brand-500/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-midnight hover:border-brand-500/30'}`}>
                  {payMethod === 'CREDIPAY' && <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-6 w-6 h-6 text-brand-500" />}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${payMethod === 'CREDIPAY' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-indigo-500'}`}>
                    <Zap className="w-7 h-7 fill-current" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-display font-black text-lg text-gray-900 dark:text-white">CrediPay Credit</p>
                    <p className="text-xs font-medium text-gray-500">Buy Now, Pay in 7 Days • 2.8% Platform Fee</p>
                    {ledger && <p className="text-[10px] font-black text-green-500 uppercase mt-1 tracking-widest">Available Credit: ₹{Number(ledger.available_credit).toFixed(0)}</p>}
                  </div>
                </button>
              </div>
            </div>

            {/* Item Summary */}
            <div className="card-premium">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-6 h-6 text-brand-500" />
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Order Summary</h2>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map(i => (
                  <div key={i.product_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-midnight p-2 border border-white/5 flex items-center justify-center text-xl">
                        {i.image_url ? <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','')}${i.image_url}`} className="w-full h-full object-contain" /> : '🛍️'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{i.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{i.qty} Units • {i.unit}</p>
                      </div>
                    </div>
                    <span className="font-display font-black text-gray-900 dark:text-white">₹{(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              
              {/* Points Card */}
              {loyalty?.loyalty_points > 0 && (
                <div className="card-premium border-brand-500/20 bg-brand-500/5 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-luxury-gold flex items-center justify-center text-white shadow-lg">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-gray-900 dark:text-white">Loyalty Perks</h3>
                        <p className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">{loyalty.loyalty_points} Points Available</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRedeem(!redeem)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${redeem ? 'bg-luxury-gold shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-gray-300 dark:bg-white/10'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${redeem ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed mb-4 relative z-10">
                    {redeem ? `You are saving ₹${pointsDiscount.toFixed(2)} with your points.` : `Redeem your points to save up to ₹${Math.min(subtotal, loyalty.loyalty_points / 10).toFixed(0)} on this order.`}
                  </p>
                </div>
              )}

              {/* Bill Card */}
              <div className="card-premium border-midnight-lightest/50 shadow-2xl">
                <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-8 italic uppercase tracking-tighter">Bill Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Items Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {platformFee > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">CrediPay Platform Fee (2.8%)</span>
                      <span className="text-brand-500">+₹{platformFee.toFixed(2)}</span>
                    </div>
                  )}

                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">Shipping & Delivery</span>
                      <span className="text-gray-900 dark:text-white">+₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-luxury-gold">
                      <span>Loyalty Reward</span>
                      <span>-₹{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-100 dark:bg-white/5 my-6"></div>

                  <div className="flex justify-between items-end">
                    <span className="font-display font-black text-2xl text-gray-900 dark:text-white italic uppercase tracking-tighter">Grand Total</span>
                    <span className="font-display font-black text-3xl text-brand-500 tracking-tighter">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={placeOrder} 
                  disabled={placing} 
                  className="btn-premium w-full py-5 text-lg flex items-center justify-center gap-4 group"
                >
                  {placing ? 'Processing...' : `Place Order`}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-3 opacity-40">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Bank-Level Security</span>
                </div>
              </div>

              {payMethod === 'CREDIPAY' && (
                <div className="card-premium bg-brand-500/5 border-brand-500/20 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-brand-500 fill-current" />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">CrediPay Guidelines</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    Payment must be settled within <span className="text-brand-500 font-bold">7 days</span> to avoid interest. 
                    Late payments attract 0.5%/week interest on the outstanding balance.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
