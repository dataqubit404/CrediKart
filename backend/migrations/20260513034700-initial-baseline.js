'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), unique: true, allowNull: false },
      phone: { type: Sequelize.STRING(20) },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('ADMIN', 'CUSTOMER', 'SHOPKEEPER', 'DELIVERY'), allowNull: false },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      email_verify_token: { type: Sequelize.STRING(255) },
      id_proof_url: { type: Sequelize.STRING(500) },
      credit_limit: { type: Sequelize.DECIMAL(10, 2), defaultValue: 5000.00 },
      is_blocked: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_available: { type: Sequelize.BOOLEAN, defaultValue: true },
      loyalty_points: { type: Sequelize.INTEGER, defaultValue: 0 },
      referral_code: { type: Sequelize.STRING(50), unique: true },
      referred_by_id: { type: Sequelize.INTEGER },
      membership_tier: { type: Sequelize.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM'), defaultValue: 'BRONZE' },
      refresh_token: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 2. shops
    await queryInterface.createTable('shops', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      owner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      image_url: { type: Sequelize.STRING(500) },
      address: { type: Sequelize.TEXT, allowNull: false },
      lat: { type: Sequelize.DECIMAL(10, 8) },
      lng: { type: Sequelize.DECIMAL(11, 8) },
      status: { type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'), defaultValue: 'PENDING' },
      is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      bank_qr_url: { type: Sequelize.STRING(500) },
      credipay_qr_url: { type: Sequelize.STRING(500) },
      verification_doc_url: { type: Sequelize.STRING(500) },
      rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0.00 },
      total_orders: { type: Sequelize.INTEGER, defaultValue: 0 },
      withdrawable_balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 3. products
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      shop_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'shops', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      mrp: { type: Sequelize.DECIMAL(10, 2) },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      unit: { type: Sequelize.STRING(50) },
      category: { type: Sequelize.STRING(100) },
      image_url: { type: Sequelize.STRING(500) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      expiry_date: { type: Sequelize.DATEONLY },
      is_flash_sale: { type: Sequelize.BOOLEAN, defaultValue: false },
      flash_price: { type: Sequelize.DECIMAL(10, 2) },
      flash_ends_at: { type: Sequelize.DATE },
      is_donation: { type: Sequelize.BOOLEAN, defaultValue: false },
      offer_type: { type: Sequelize.ENUM('NONE', 'BOGO', 'COMBO'), defaultValue: 'NONE' },
      combo_product_id: { type: Sequelize.INTEGER },
      combo_discount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 4. orders
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      shop_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'shops', key: 'id' } },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      delivery_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      platform_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_method: { type: Sequelize.ENUM('RAZORPAY', 'CREDIPAY'), allowNull: false },
      delivery_type: { type: Sequelize.ENUM('PICKUP', 'DELIVERY'), allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COLLECTED', 'CANCELLED', 'REFUNDED'),
        defaultValue: 'PENDING',
      },
      address: { type: Sequelize.TEXT },
      razorpay_order_id: { type: Sequelize.STRING(200) },
      razorpay_payment_id: { type: Sequelize.STRING(200) },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 5. order_items
    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      qty: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      product_name: { type: Sequelize.STRING(200) },
      is_flash_sale: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_donation: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 6. credipay_ledger
    await queryInterface.createTable('credipay_ledger', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      customer_id: { type: Sequelize.INTEGER, unique: true, allowNull: false, references: { model: 'users', key: 'id' } },
      credit_limit: { type: Sequelize.DECIMAL(10, 2), defaultValue: 5000.00 },
      total_due: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      interest_accrued: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      total_paid: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      last_interest_calc: { type: Sequelize.DATE },
      on_time_payments_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      consecutive_on_time_payments: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 7. credipay_entries
    await queryInterface.createTable('credipay_entries', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      ledger_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'credipay_ledger', key: 'id' } },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' } },
      shop_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'shops', key: 'id' } },
      principal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      platform_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      interest_due: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      total_due: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      amount_paid: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      status: { type: Sequelize.ENUM('PENDING', 'PARTIAL', 'PAID', 'OVERDUE'), defaultValue: 'PENDING' },
      due_date: { type: Sequelize.DATE, allowNull: false },
      paid_at: { type: Sequelize.DATE },
      last_interest_calc: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 8. credipay_payments
    await queryInterface.createTable('credipay_payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      entry_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'credipay_entries', key: 'id' } },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      shopkeeper_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: { type: Sequelize.ENUM('QR_CASH', 'RAZORPAY', 'BANK_TRANSFER'), allowNull: false },
      confirmed_by_shop: { type: Sequelize.BOOLEAN, defaultValue: false },
      razorpay_id: { type: Sequelize.STRING(200) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 9. interest_rules
    await queryInterface.createTable('interest_rules', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), defaultValue: 'Default' },
      free_days: { type: Sequelize.INTEGER, defaultValue: 7 },
      base_rate: { type: Sequelize.DECIMAL(5, 4), defaultValue: 0.0280 },
      overdue_rate: { type: Sequelize.DECIMAL(5, 4), defaultValue: 0.0050 },
      interval_days: { type: Sequelize.INTEGER, defaultValue: 7 },
      max_rate: { type: Sequelize.DECIMAL(5, 4), defaultValue: 0.3000 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 10. subscription_plans
    await queryInterface.createTable('subscription_plans', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      type: { type: Sequelize.ENUM('CUSTOMER', 'SHOPKEEPER'), allowNull: false },
      price_monthly: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      price_yearly: { type: Sequelize.DECIMAL(10, 2) },
      benefits: { type: Sequelize.JSON },
      credit_limit: { type: Sequelize.DECIMAL(10, 2) },
      interest_discount: { type: Sequelize.DECIMAL(5, 4), defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 11. user_subscriptions
    await queryInterface.createTable('user_subscriptions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      plan_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'subscription_plans', key: 'id' } },
      starts_at: { type: Sequelize.DATE, allowNull: false },
      ends_at: { type: Sequelize.DATE, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      razorpay_sub_id: { type: Sequelize.STRING(200) },
      billing_cycle: { type: Sequelize.ENUM('MONTHLY', 'YEARLY'), defaultValue: 'MONTHLY' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 12. delivery_assignments
    await queryInterface.createTable('delivery_assignments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' } },
      partner_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.ENUM('ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED'), defaultValue: 'ASSIGNED' },
      earned: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      assigned_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      delivered_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 13. notifications
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      type: { type: Sequelize.ENUM('ORDER', 'PAYMENT', 'CREDIT', 'APPROVAL', 'SYSTEM', 'SUBSCRIPTION'), allowNull: false },
      title: { type: Sequelize.STRING(200) },
      message: { type: Sequelize.TEXT },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      data: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    // 14. loyalty_transactions
    await queryInterface.createTable('loyalty_transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      type: { type: Sequelize.ENUM('EARNED', 'REDEEMED', 'REFERRAL_BONUS'), allowNull: false },
      description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order
    await queryInterface.dropTable('loyalty_transactions');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('delivery_assignments');
    await queryInterface.dropTable('user_subscriptions');
    await queryInterface.dropTable('subscription_plans');
    await queryInterface.dropTable('interest_rules');
    await queryInterface.dropTable('credipay_payments');
    await queryInterface.dropTable('credipay_entries');
    await queryInterface.dropTable('credipay_ledger');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('shops');
    await queryInterface.dropTable('users');
  }
};
