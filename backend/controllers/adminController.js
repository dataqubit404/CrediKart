const { User, Shop, Order, CrediPayLedger, UserSubscription, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers, totalShops, totalOrders,
      pendingShops, pendingCustomers,
    ] = await Promise.all([
      User.count({ where: { role: { [Op.ne]: 'ADMIN' } } }),
      Shop.count({ where: { status: 'APPROVED' } }),
      Order.count(),
      Shop.count({ where: { status: 'PENDING' } }),
      User.count({ where: { role: 'CUSTOMER', is_verified: false } }),
    ]);

    const [revenue] = await sequelize.query(`
      SELECT
        SUM(total) as total_revenue,
        SUM(platform_fee) as platform_earnings,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total ELSE 0 END) as today_revenue,
        SUM(CASE WHEN payment_method = 'CREDIPAY' THEN platform_fee ELSE 0 END) as credipay_earnings
      FROM orders WHERE status != 'CANCELLED'
    `);

    const activeSubscriptions = await UserSubscription.count({ where: { is_active: true } });

    res.json({
      users: totalUsers,
      shops: totalShops,
      orders: totalOrders,
      pending_shops: pendingShops,
      pending_customers: pendingCustomers,
      active_subscriptions: activeSubscriptions,
      ...revenue[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, is_blocked, q, page = 1, limit = 20 } = req.query;
    const where = { role: { [Op.ne]: 'ADMIN' } };
    if (role) where.role = role;
    if (is_blocked !== undefined) where.is_blocked = is_blocked === 'true';
    if (q) where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ];

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ users: users.rows, total: users.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'ADMIN') return res.status(403).json({ error: 'Cannot block admin' });

    await user.update({ is_blocked: !user.is_blocked });
    res.json({ success: true, is_blocked: !user.is_blocked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const [pendingShops, pendingCustomers] = await Promise.all([
      Shop.findAll({
        where: { status: 'PENDING' },
        include: [{ model: User, as: 'owner', attributes: ['name', 'email', 'phone'] }],
        order: [['created_at', 'ASC']],
      }),
      User.findAll({
        where: { role: 'CUSTOMER', is_verified: false, id_proof_url: { [Op.ne]: null } },
        attributes: { exclude: ['password_hash', 'refresh_token'] },
        order: [['created_at', 'ASC']],
      }),
    ]);

    res.json({ pending_shops: pendingShops, pending_customers: pendingCustomers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
};

exports.approveCustomer = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'CUSTOMER' } });
    if (!user) return res.status(404).json({ error: 'Customer not found' });

    await user.update({ is_verified: true });
    await Notification.create({
      user_id: user.id,
      type: 'APPROVAL',
      title: 'ID Verified!',
      message: 'Your identity has been verified. You can now place orders on CrediKart.',
    });

    res.json({ success: true, message: 'Customer approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve customer' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, payment_method, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (payment_method) where.payment_method = payment_method;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
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

exports.processRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ status: 'REFUNDED' });

    await Notification.create({
      user_id: order.customer_id,
      type: 'PAYMENT',
      title: 'Refund Processed',
      message: `Refund of ₹${order.total} for Order #${order.id} has been processed. Reason: ${reason}`,
    });

    res.json({ success: true, message: 'Refund processed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process refund' });
  }
};
