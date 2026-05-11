const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ─── USER ───────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('ADMIN', 'CUSTOMER', 'SHOPKEEPER', 'DELIVERY'), allowNull: false },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verify_token: { type: DataTypes.STRING(255) },
  id_proof_url: { type: DataTypes.STRING(500) },
  credit_limit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 5000.00 },
  is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true }, // for delivery partner
  loyalty_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  referral_code: { type: DataTypes.STRING(50), unique: true },
  referred_by_id: { type: DataTypes.INTEGER },
  membership_tier: { type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'), defaultValue: 'BRONZE' },
  refresh_token: { type: DataTypes.TEXT },
}, { tableName: 'users', underscored: true });

// ─── LOYALTY TRANSACTION ──────────────────────────────────────────────────────
const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('EARNED', 'REDEEMED', 'REFERRAL_BONUS'), allowNull: false },
  description: { type: DataTypes.TEXT },
}, { tableName: 'loyalty_transactions', underscored: true });

// ─── SHOP ────────────────────────────────────────────────────────────────────
const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.STRING(500) },
  address: { type: DataTypes.TEXT, allowNull: false },
  lat: { type: DataTypes.DECIMAL(10, 8) },
  lng: { type: DataTypes.DECIMAL(11, 8) },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'), defaultValue: 'PENDING' },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  bank_qr_url: { type: DataTypes.STRING(500) },
  credipay_qr_url: { type: DataTypes.STRING(500) },
  verification_doc_url: { type: DataTypes.STRING(500) },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  total_orders: { type: DataTypes.INTEGER, defaultValue: 0 },
  withdrawable_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
}, { tableName: 'shops', underscored: true });

// ─── PRODUCT ─────────────────────────────────────────────────────────────────
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  mrp: { type: DataTypes.DECIMAL(10, 2) },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  unit: { type: DataTypes.STRING(50) },
  category: { type: DataTypes.STRING(100) },
  image_url: { type: DataTypes.STRING(500) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  expiry_date: { type: DataTypes.DATEONLY },
  is_flash_sale: { type: DataTypes.BOOLEAN, defaultValue: false },
  flash_price: { type: DataTypes.DECIMAL(10, 2) },
  flash_ends_at: { type: DataTypes.DATE },
  is_donation: { type: DataTypes.BOOLEAN, defaultValue: false },
  offer_type: { type: DataTypes.ENUM('NONE', 'BOGO', 'COMBO'), defaultValue: 'NONE' },
  combo_product_id: { type: DataTypes.INTEGER },
  combo_discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: 'products', underscored: true });

// ─── ORDER ───────────────────────────────────────────────────────────────────
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  delivery_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  platform_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('RAZORPAY', 'CREDIPAY'), allowNull: false },
  delivery_type: { type: DataTypes.ENUM('PICKUP', 'DELIVERY'), allowNull: false },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COLLECTED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PENDING',
  },
  address: { type: DataTypes.TEXT },
  razorpay_order_id: { type: DataTypes.STRING(200) },
  razorpay_payment_id: { type: DataTypes.STRING(200) },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'orders', underscored: true });

// ─── ORDER ITEM ───────────────────────────────────────────────────────────────
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  product_name: { type: DataTypes.STRING(200) }, // snapshot
  is_flash_sale: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_donation: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'order_items', underscored: true });

// ─── CREDIPAY LEDGER ──────────────────────────────────────────────────────────
const CrediPayLedger = sequelize.define('CrediPayLedger', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  credit_limit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 5000.00 },
  total_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  interest_accrued: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  last_interest_calc: { type: DataTypes.DATE },
  on_time_payments_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  consecutive_on_time_payments: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'credipay_ledger', underscored: true });

// ─── CREDIPAY ENTRY ───────────────────────────────────────────────────────────
const CrediPayEntry = sequelize.define('CrediPayEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ledger_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  shop_id: { type: DataTypes.INTEGER, allowNull: false },
  principal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  platform_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  interest_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_due: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  amount_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  status: { type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE'), defaultValue: 'PENDING' },
  due_date: { type: DataTypes.DATE, allowNull: false },
  paid_at: { type: DataTypes.DATE },
  last_interest_calc: { type: DataTypes.DATE },
}, { tableName: 'credipay_entries', underscored: true });

// ─── CREDIPAY PAYMENT ─────────────────────────────────────────────────────────
const CrediPayPayment = sequelize.define('CrediPayPayment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entry_id: { type: DataTypes.INTEGER, allowNull: false },
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  shopkeeper_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.ENUM('QR_CASH', 'RAZORPAY', 'BANK_TRANSFER'), allowNull: false },
  confirmed_by_shop: { type: DataTypes.BOOLEAN, defaultValue: false },
  razorpay_id: { type: DataTypes.STRING(200) },
}, { tableName: 'credipay_payments', underscored: true });

// ─── INTEREST RULE ────────────────────────────────────────────────────────────
const InterestRule = sequelize.define('InterestRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), defaultValue: 'Default' },
  free_days: { type: DataTypes.INTEGER, defaultValue: 7 },
  base_rate: { type: DataTypes.DECIMAL(5, 4), defaultValue: 0.0280 },
  overdue_rate: { type: DataTypes.DECIMAL(5, 4), defaultValue: 0.0050 },
  interval_days: { type: DataTypes.INTEGER, defaultValue: 7 },
  max_rate: { type: DataTypes.DECIMAL(5, 4), defaultValue: 0.3000 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'interest_rules', underscored: true });

// ─── SUBSCRIPTION PLAN ────────────────────────────────────────────────────────
const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  type: { type: DataTypes.ENUM('CUSTOMER', 'SHOPKEEPER'), allowNull: false },
  price_monthly: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price_yearly: { type: DataTypes.DECIMAL(10, 2) },
  benefits: { type: DataTypes.JSON },
  credit_limit: { type: DataTypes.DECIMAL(10, 2) },
  interest_discount: { type: DataTypes.DECIMAL(5, 4), defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'subscription_plans', underscored: true });

// ─── USER SUBSCRIPTION ────────────────────────────────────────────────────────
const UserSubscription = sequelize.define('UserSubscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  plan_id: { type: DataTypes.INTEGER, allowNull: false },
  starts_at: { type: DataTypes.DATE, allowNull: false },
  ends_at: { type: DataTypes.DATE, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  razorpay_sub_id: { type: DataTypes.STRING(200) },
  billing_cycle: { type: DataTypes.ENUM('MONTHLY', 'YEARLY'), defaultValue: 'MONTHLY' },
}, { tableName: 'user_subscriptions', underscored: true });

// ─── DELIVERY ASSIGNMENT ──────────────────────────────────────────────────────
const DeliveryAssignment = sequelize.define('DeliveryAssignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  partner_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED'), defaultValue: 'ASSIGNED' },
  earned: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  delivered_at: { type: DataTypes.DATE },
}, { tableName: 'delivery_assignments', underscored: true });

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('ORDER', 'PAYMENT', 'CREDIT', 'APPROVAL', 'SYSTEM', 'SUBSCRIPTION'), allowNull: false },
  title: { type: DataTypes.STRING(200) },
  message: { type: DataTypes.TEXT },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  data: { type: DataTypes.JSON },
}, { tableName: 'notifications', underscored: true });

// ─── ASSOCIATIONS ─────────────────────────────────────────────────────────────
User.hasOne(Shop, { foreignKey: 'owner_id', as: 'shop' });
Shop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Shop.hasMany(Product, { foreignKey: 'shop_id', as: 'products' });
Product.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Shop.hasMany(Order, { foreignKey: 'shop_id', as: 'orders' });
Order.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasOne(CrediPayLedger, { foreignKey: 'customer_id', as: 'ledger' });
CrediPayLedger.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

CrediPayLedger.hasMany(CrediPayEntry, { foreignKey: 'ledger_id', as: 'entries' });
CrediPayEntry.belongsTo(CrediPayLedger, { foreignKey: 'ledger_id', as: 'ledger' });
CrediPayEntry.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
CrediPayEntry.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

CrediPayEntry.hasMany(CrediPayPayment, { foreignKey: 'entry_id', as: 'payments' });
CrediPayPayment.belongsTo(CrediPayEntry, { foreignKey: 'entry_id', as: 'entry' });

User.hasMany(UserSubscription, { foreignKey: 'user_id', as: 'subscriptions' });
UserSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'plan' });

Order.hasOne(DeliveryAssignment, { foreignKey: 'order_id', as: 'delivery' });
DeliveryAssignment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
DeliveryAssignment.belongsTo(User, { foreignKey: 'partner_id', as: 'partner' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LoyaltyTransaction, { foreignKey: 'user_id', as: 'loyaltyTransactions' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User, Shop, Product, Order, OrderItem,
  CrediPayLedger, CrediPayEntry, CrediPayPayment,
  InterestRule, SubscriptionPlan, UserSubscription,
  DeliveryAssignment, Notification, LoyaltyTransaction,
};
