const nodemailer = require('nodemailer');

// nodemailer 8.x compatible
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
});

const send = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[Mailer] SMTP not configured – skipping email to ${to}: "${subject}"`);
    return;
  }
  return await transporter.sendMail({
    from: process.env.SMTP_FROM || 'CrediKart <noreply@credikart.com>',
    to, subject, html,
  });
};

exports.sendVerificationEmail = async (to, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await send(to, 'Verify your CrediKart account', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#f59e0b">Welcome to CrediKart, ${name}!</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${url}" style="display:inline-block;background:#f59e0b;color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Link expires in 24 hours.</p>
    </div>`);
};

exports.sendOrderConfirmation = async (to, name, order) => {
  await send(to, `Order #${order.id} Confirmed – CrediKart`, `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#f59e0b">Order Confirmed!</h2>
      <p>Hi ${name}, your order <strong>#${order.id}</strong> of <strong>₹${order.total}</strong> is placed.</p>
      <p>Payment: <strong>${order.payment_method}</strong> | Delivery: <strong>${order.delivery_type}</strong></p>
    </div>`);
};

exports.sendPaymentReminder = async (to, name, amount, dueDate) => {
  await send(to, `⚠ CrediPay Payment Due – ₹${amount}`, `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
      <h2 style="color:#ef4444">Payment Reminder</h2>
      <p>Hi ${name}, your CrediPay balance of <strong>₹${amount}</strong> is due by <strong>${new Date(dueDate).toDateString()}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/credit" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Pay Now →</a>
    </div>`);
};
