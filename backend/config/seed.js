require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./database');
const { User, Shop, Product, SubscriptionPlan, InterestRule } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('🌱 Starting seed...');

    // Admin user
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@credikart.com' },
      defaults: {
        name: 'Platform Admin',
        email: 'admin@credikart.com',
        phone: '9999999999',
        password_hash: adminHash,
        role: 'ADMIN',
        is_verified: true,
        is_email_verified: true,
      },
    });
    console.log('✅ Admin created: admin@credikart.com / Admin@123');

    // Sample shopkeeper
    const shopHash = await bcrypt.hash('Shop@123', 12);
    const [shopkeeper] = await User.findOrCreate({
      where: { email: 'shop@credikart.com' },
      defaults: {
        name: 'Demo Shopkeeper',
        email: 'shop@credikart.com',
        phone: '8888888888',
        password_hash: shopHash,
        role: 'SHOPKEEPER',
        is_verified: true,
        is_email_verified: true,
      },
    });

    // Sample shop
    const [shop] = await Shop.findOrCreate({
      where: { owner_id: shopkeeper.id },
      defaults: {
        name: 'Fresh Mart',
        description: 'Fresh groceries delivered fast',
        address: '123 Main Street, Mumbai',
        lat: 19.0760,
        lng: 72.8777,
        status: 'APPROVED',
        is_featured: true,
      },
    });

    // Sample products
    const products = [
      { name: 'Amul Milk 500ml', price: 28, mrp: 30, stock: 100, category: 'Dairy', unit: '500ml' },
      { name: 'Brown Bread', price: 45, mrp: 50, stock: 50, category: 'Bakery', unit: '400g' },
      { name: 'Tata Salt 1kg', price: 22, mrp: 25, stock: 200, category: 'Staples', unit: '1kg' },
      { name: 'Fortune Sunflower Oil 1L', price: 165, mrp: 180, stock: 80, category: 'Oils', unit: '1L' },
      { name: 'Basmati Rice 5kg', price: 350, mrp: 380, stock: 40, category: 'Staples', unit: '5kg' },
      { name: 'Aashirvaad Atta 5kg', price: 280, mrp: 300, stock: 60, category: 'Staples', unit: '5kg' },
      { name: 'Surf Excel 1kg', price: 185, mrp: 200, stock: 70, category: 'Cleaning', unit: '1kg' },
      { name: 'Maggi 2-min Noodles 4pk', price: 72, mrp: 80, stock: 150, category: 'Instant Food', unit: '4x70g' },
    ];
    for (const p of products) {
      await Product.findOrCreate({ where: { shop_id: shop.id, name: p.name }, defaults: { shop_id: shop.id, ...p } });
    }
    console.log('✅ Sample shop & products created');

    // Sample customer
    const custHash = await bcrypt.hash('Cust@123', 12);
    await User.findOrCreate({
      where: { email: 'customer@credikart.com' },
      defaults: {
        name: 'Demo Customer',
        email: 'customer@credikart.com',
        phone: '7777777777',
        password_hash: custHash,
        role: 'CUSTOMER',
        is_verified: true,
        is_email_verified: true,
        credit_limit: 5000,
      },
    });
    console.log('✅ Sample customer created: customer@credikart.com / Cust@123');

    // Subscription plans
    const plans = [
      {
        name: 'CrediPlus',
        type: 'CUSTOMER',
        price_monthly: 99,
        price_yearly: 999,
        credit_limit: 15000,
        interest_discount: 0.001,
        benefits: JSON.stringify(['₹15,000 credit limit', '0.1% interest discount', 'Priority checkout', 'Email support']),
      },
      {
        name: 'CrediPremium',
        type: 'CUSTOMER',
        price_monthly: 249,
        price_yearly: 2499,
        credit_limit: 50000,
        interest_discount: 0.003,
        benefits: JSON.stringify(['₹50,000 credit limit', '0.3% interest discount', 'Priority support', 'Early access']),
      },
      {
        name: 'ShopPro',
        type: 'SHOPKEEPER',
        price_monthly: 199,
        price_yearly: 1999,
        benefits: JSON.stringify(['Featured badge', 'Priority search placement', 'Advanced analytics', 'Bulk upload']),
      },
      {
        name: 'ShopElite',
        type: 'SHOPKEEPER',
        price_monthly: 499,
        price_yearly: 4999,
        benefits: JSON.stringify(['Top placement', 'Real-time insights', 'Dedicated account manager', 'Custom QR']),
      },
    ];
    for (const plan of plans) {
      await SubscriptionPlan.findOrCreate({ where: { name: plan.name }, defaults: plan });
    }
    console.log('✅ Subscription plans created');

    console.log('\n🎉 Seed complete!\n');
    console.log('Login credentials:');
    console.log('  Admin:    admin@credikart.com    / Admin@123');
    console.log('  Shop:     shop@credikart.com     / Shop@123');
    console.log('  Customer: customer@credikart.com / Cust@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
