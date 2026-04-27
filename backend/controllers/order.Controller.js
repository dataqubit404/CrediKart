const { sequelize, Order, OrderItem, Product, Shop, CrediPayLedger, DeliveryAssignment, Notification, User } = require('../models');
const crediPayEngine = require('../services/crediPayEngine');
const razorpayService = require('../services/razorpay');

exports.placeOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shop_id, items, payment_method, delivery_type, address, notes } = req.body;
    const customer_id = req.user.id;

    // Validate customer verification for first order
    if (!req.user.is_verified) {
      const pastOrders = await Order.count({ where: { customer_id } });
      if (pastOrders === 0) {
        await t.rollback();
        return res.status(403).json({ error: 'ID verification required for first order. Please upload your ID proof.' });
      }
    }

    // Validate shop
    const shop = await Shop.findOne({ where: { id: shop_id, status: 'APPROVED' }, transaction: t });
    if (!shop) { await t.rollback(); return res.status(404).json({ error: 'Shop not found or not active' }); }

    // Validate & enrich items
    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.product_id, shop_id, is_active: true },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product) { await t.rollback(); return res.status(400).json({ error: `Product ${item.product_id} not found` }); }
      if (product.stock < item.qty) { await t.rollback(); return res.status(400).json({ error: `Insufficient stock for ${product.name}` }); }

      const totalPrice = parseFloat((product.price * item.qty).toFixed(2));
      subtotal += totalPrice;
      enrichedItems.push({
        product_id: item.product_id,
        product_name: product.name,
        qty: item.qty,
        unit_price: product.price,
        total_price: totalPrice,
      });
    }
    subtotal = parseFloat(subtotal.toFixed(2));

    // Calculate fees
    const platform_fee = payment_method === 'CREDIPAY'
      ? parseFloat((subtotal * (parseFloat(process.env.CREDIPAY_PLATFORM_FEE_RATE) || 0.028)).toFixed(2))
      : 0;
    const delivery_fee = delivery_type === 'DELIVERY' ? 25 : 0;
    const total = parseFloat((subtotal + platform_fee + delivery_fee).toFixed(2));

    // CrediPay credit check
    if (payment_method === 'CREDIPAY') {
      let ledger = await CrediPayLedger.findOne({ where: { customer_id }, transaction: t });
      if (!ledger) ledger = await CrediPayLedger.create({ customer_id, credit_limit: req.user.credit_limit }, { transaction: t });

      const available = parseFloat((ledger.credit_limit - ledger.total_due).toFixed(2));
      if (available < total) {
        await t.rollback();
        return res.status(400).json({ error: `Insufficient CrediPay credit. Available: ₹${available}` });
      }
    }

    // Create Razorpay order if needed
    let razorpay_order_id = null;
    if (payment_method === 'RAZORPAY') {
      const rzpOrder = await razorpayService.createOrder(total);
      razorpay_order_id = rzpOrder.id;
    }

    // Create order
    const order = await Order.create({
      customer_id, shop_id, subtotal, platform_fee, delivery_fee, total,
      payment_method, delivery_type, address, notes,
      status: payment_method === 'CREDIPAY' ? 'CONFIRMED' : 'PENDING',
      razorpay_order_id,
    }, { transaction: t });

    // Create order items & reduce stock
    for (const item of enrichedItems) {
      await OrderItem.create({ order_id: order.id, ...item }, { transaction: t });
      await Product.decrement('stock', { by: item.qty, where: { id: item.product_id }, transaction: t });
    }

    // Update shop order count
    await Shop.increment('total_orders', { by: 1, where: { id: shop_id }, transaction: t });

    // CrediPay entry
    if (payment_method === 'CREDIPAY') {
      await crediPayEngine.createEntry({ order, customer_id, platform_fee, transaction: t });
    }

    await t.commit();

    // Notify shopkeeper (after commit)
    try {
      await Notification.create({
        user_id: shop.owner_id,
        type: 'ORDER',
        title: 'New Order Received!',
        message: `Order #${order.id} for ₹${total} via ${payment_method}`,
        data: { order_id: order.id },
      });
    } catch (e) { /* non-critical */ }

    res.status(201).json({
      success: true,
      order_id: order.id,
      total,
      payment_method,
      razorpay_order_id,
    });
  } catch (err) {
    await t.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const valid = razorpayService.verifySignature(order.razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) return res.status(400).json({ error: 'Invalid payment signature' });

    await order.update({ status: 'CONFIRMED', razorpay_payment_id });
    res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (req.user.role === 'CUSTOMER') where.customer_id = req.user.id;
    else if (req.user.role === 'SHOPKEEPER') {
      const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
      if (!shop) return res.json({ orders: [] });
      where.shop_id = shop.id;
    }

    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ orders: orders.rows, total: orders.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['name', 'image_url'] }] },
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'phone'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: DeliveryAssignment, as: 'delivery', include: [{ model: User, as: 'partner', attributes: ['name', 'phone'] }] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Authorization
    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    const canAccess = req.user.role === 'ADMIN'
      || order.customer_id === req.user.id
      || (shop && order.shop_id === shop.id);
    if (!canAccess) return res.status(403).json({ error: 'Access denied' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    if (req.user.role !== 'ADMIN' && (!shop || order.shop_id !== shop.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const valid = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    await order.update({ status });

    // Notify customer
    await Notification.create({
      user_id: order.customer_id,
      type: 'ORDER',
      title: 'Order Update',
      message: `Your order #${order.id} is now ${status}`,
      data: { order_id: order.id, status },
    });

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, customer_id: req.user.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }
    await order.update({ status: 'CANCELLED' });
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
