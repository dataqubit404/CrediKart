const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { authLimiter, upload, uploadLimiter } = require('../middleware/middleware');

const authCtrl = require('../controllers/authController');
const shopCtrl = require('../controllers/shopController');
const productCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const crediPayCtrl = require('../controllers/crediPayController');
const adminCtrl = require('../controllers/adminController');
const subCtrl = require('../controllers/subscriptionController');
const deliveryCtrl = require('../controllers/deliveryController');
const loyaltyCtrl = require('../controllers/loyaltyController');
const { Notification } = require('../models');

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authLimiter, authCtrl.register);
router.post('/auth/login', authLimiter, authCtrl.login);
router.get('/auth/verify-email/:token', authCtrl.verifyEmail);
router.post('/auth/refresh', authCtrl.refreshToken);
router.get('/auth/me', auth, authCtrl.me);
router.post('/auth/logout', auth, authCtrl.logout);

// ── Upload ID proof (customer) ────────────────────────────────────────────────
router.post('/auth/upload-id',
  auth, requireRole('CUSTOMER'), uploadLimiter,
  upload.single('id_proof'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'File required' });
    await req.user.update({ id_proof_url: `/uploads/id_proof/${req.file.filename}` });
    res.json({ success: true, url: `/uploads/id_proof/${req.file.filename}` });
  }
);

// ── Shops ────────────────────────────────────────────────────────────────────
router.get('/shops', shopCtrl.getShops);
router.get('/shops/my', auth, requireRole('SHOPKEEPER'), shopCtrl.getMyShop);
router.get('/shops/analytics', auth, requireRole('SHOPKEEPER'), shopCtrl.getShopAnalytics);
router.get('/shops/settlement', auth, requireRole('SHOPKEEPER'), shopCtrl.getShopSettlement);
router.get('/shops/:id', shopCtrl.getShopById);
router.post('/shops', auth, requireRole('SHOPKEEPER'), uploadLimiter,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'verification_doc', maxCount: 1 }]),
  shopCtrl.createShop
);
router.put('/shops/:id', auth, requireRole('SHOPKEEPER'), uploadLimiter,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bank_qr', maxCount: 1 }]),
  shopCtrl.updateShop
);
router.post('/shops/:id/approve', auth, requireRole('ADMIN'), shopCtrl.approveShop);

// ── Products ─────────────────────────────────────────────────────────────────
router.get('/products', productCtrl.getProducts);
router.get('/products/categories', productCtrl.getCategories);
router.get('/products/:id', productCtrl.getProductById);
router.post('/products', auth, requireRole('SHOPKEEPER'), upload.single('image'), productCtrl.createProduct);
router.put('/products/:id', auth, requireRole('SHOPKEEPER'), upload.single('image'), productCtrl.updateProduct);
router.delete('/products/:id', auth, requireRole('SHOPKEEPER'), productCtrl.deleteProduct);

// ── Orders ───────────────────────────────────────────────────────────────────
router.post('/orders', auth, requireRole('CUSTOMER'), orderCtrl.placeOrder);
router.post('/orders/verify-payment', auth, requireRole('CUSTOMER'), orderCtrl.verifyRazorpayPayment);
router.get('/orders', auth, orderCtrl.getMyOrders);
router.get('/orders/:id', auth, orderCtrl.getOrderById);
router.put('/orders/:id/status', auth, requireRole('SHOPKEEPER', 'ADMIN'), orderCtrl.updateOrderStatus);
router.post('/orders/:id/cancel', auth, requireRole('CUSTOMER'), orderCtrl.cancelOrder);

// ── CrediPay ─────────────────────────────────────────────────────────────────
router.get('/credipay/ledger', auth, requireRole('CUSTOMER'), crediPayCtrl.getMyLedger);
router.get('/credipay/entries', auth, requireRole('CUSTOMER'), crediPayCtrl.getMyEntries);
router.get('/credipay/receivables', auth, requireRole('SHOPKEEPER'), crediPayCtrl.getReceivables);
router.post('/credipay/pay', auth, requireRole('CUSTOMER'), crediPayCtrl.recordPayment);
router.post('/credipay/confirm-payment/:id', auth, requireRole('SHOPKEEPER'), crediPayCtrl.confirmPayment);
router.get('/credipay/rules', crediPayCtrl.getInterestRules);
router.put('/credipay/rules', auth, requireRole('ADMIN'), crediPayCtrl.updateInterestRules);
router.post('/credipay/calculate-interest', auth, requireRole('ADMIN'), crediPayCtrl.triggerInterestCalc);
router.get('/loyalty/me', auth, loyaltyCtrl.getLoyaltyInfo);

// ── Subscriptions ─────────────────────────────────────────────────────────────
router.get('/subscriptions/plans', subCtrl.getPlans);
router.get('/subscriptions/my-plan', auth, subCtrl.getMySubscription);
router.post('/subscriptions/subscribe', auth, subCtrl.subscribe);
router.delete('/subscriptions/cancel', auth, subCtrl.cancelSubscription);
router.post('/subscriptions/plans', auth, requireRole('ADMIN'), subCtrl.createPlan);
router.put('/subscriptions/plans/:id', auth, requireRole('ADMIN'), subCtrl.updatePlan);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/dashboard', auth, requireRole('ADMIN'), adminCtrl.getDashboard);
router.get('/admin/users', auth, requireRole('ADMIN'), adminCtrl.getUsers);
router.put('/admin/users/:id/block', auth, requireRole('ADMIN'), adminCtrl.blockUser);
router.get('/admin/approvals', auth, requireRole('ADMIN'), adminCtrl.getPendingApprovals);
router.post('/admin/approve-customer/:id', auth, requireRole('ADMIN'), adminCtrl.approveCustomer);
router.get('/admin/orders', auth, requireRole('ADMIN'), adminCtrl.getAllOrders);
router.post('/admin/refund/:id', auth, requireRole('ADMIN'), adminCtrl.processRefund);

// ── Delivery ─────────────────────────────────────────────────────────────────
router.put('/delivery/availability', auth, requireRole('DELIVERY'), deliveryCtrl.toggleAvailability);
router.get('/delivery/available-orders', auth, requireRole('DELIVERY'), deliveryCtrl.getAvailableOrders);
router.post('/delivery/accept/:id', auth, requireRole('DELIVERY'), deliveryCtrl.acceptOrder);
router.put('/delivery/assignment/:id/status', auth, requireRole('DELIVERY'), deliveryCtrl.updateDeliveryStatus);
router.get('/delivery/my-deliveries', auth, requireRole('DELIVERY'), deliveryCtrl.getMyDeliveries);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', auth, async (req, res) => {
  const notifs = await Notification.findAll({
    where: { user_id: req.user.id },
    order: [['created_at', 'DESC']],
    limit: 30,
  });
  res.json(notifs);
});
router.put('/notifications/:id/read', auth, async (req, res) => {
  await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
  res.json({ success: true });
});
router.put('/notifications/read-all', auth, async (req, res) => {
  await Notification.update({ is_read: true }, { where: { user_id: req.user.id } });
  res.json({ success: true });
});

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

module.exports = router;
