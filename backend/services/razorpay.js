const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount) => {
  return await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });
};

exports.verifySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === razorpay_signature;
};

exports.fetchPayment = async (payment_id) => {
  return await razorpay.payments.fetch(payment_id);
};

exports.refundPayment = async (payment_id, amount) => {
  return await razorpay.payments.refund(payment_id, { amount: Math.round(amount * 100) });
};
