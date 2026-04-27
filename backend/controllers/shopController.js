const { Shop, User, Product, Order, Notification } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const path = require('path');

exports.createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ where: { owner_id: req.user.id } });
    if (existing) return res.status(400).json({ error: 'You already have a shop registered' });

    const { name, description, address, lat, lng } = req.body;
    const image_url = req.files?.image?.[0] ? `/uploads/image/${req.files.image[0].filename}` : null;
    const verification_doc_url = req.files?.verification_doc?.[0] ? `/uploads/verification_doc/${req.files.verification_doc[0].filename}` : null;

    const shop = await Shop.create({
      owner_id: req.user.id,
      name, description, address, lat, lng,
      image_url, verification_doc_url,
      status: 'APPROVED', // Auto-approve for development
    });

    // Generate CrediPay QR
    const qrData = JSON.stringify({ shop_id: shop.id, name: shop.name, type: 'credipay' });
    const qrPath = path.join(process.env.UPLOAD_PATH || './uploads', 'qr', `shop-${shop.id}.png`);
    const fs = require('fs');
    if (!fs.existsSync(path.dirname(qrPath))) fs.mkdirSync(path.dirname(qrPath), { recursive: true });
    await QRCode.toFile(qrPath, qrData);
    await shop.update({ credipay_qr_url: `/uploads/qr/shop-${shop.id}.png` });

    // Notify admin
    const admins = await User.findAll({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin.id,
        type: 'APPROVAL',
        title: 'New Shop Registration',
        message: `${name} has submitted for approval`,
        data: { shop_id: shop.id },
      });
    }

    res.status(201).json({ success: true, shop });
  } catch (err) {
    console.error('Create shop error:', err);
    res.status(500).json({ error: 'Failed to create shop' });
  }
};

exports.getShops = async (req, res) => {
  try {
    const { q, category, featured, page = 1, limit = 20 } = req.query;
    const where = { status: 'APPROVED' };
    if (q) where.name = { [Op.like]: `%${q}%` };
    if (featured === 'true') where.is_featured = true;

    const shops = await Shop.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['name', 'phone'] }],
      order: [['is_featured', 'DESC'], ['rating', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      shops: shops.rows,
      total: shops.count,
      page: parseInt(page),
      pages: Math.ceil(shops.count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      where: { id: req.params.id, status: 'APPROVED' },
      include: [
        { model: User, as: 'owner', attributes: ['name', 'phone'] },
        { model: Product, as: 'products', where: { is_active: true }, required: false },
      ],
    });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { id: req.params.id, owner_id: req.user.id } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const updates = {};
    const allowed = ['name', 'description', 'address', 'lat', 'lng'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.files?.image?.[0]) updates.image_url = `/uploads/image/${req.files.image[0].filename}`;
    if (req.files?.bank_qr?.[0]) updates.bank_qr_url = `/uploads/bank_qr/${req.files.bank_qr[0].filename}`;

    await shop.update(updates);
    res.json({ success: true, shop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shop' });
  }
};

exports.approveShop = async (req, res) => {
  try {
    const { status, reason } = req.body; // APPROVED or REJECTED
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    await shop.update({ status });

    // Generate CrediPay QR if approved
    if (status === 'APPROVED') {
      const qrData = JSON.stringify({ shop_id: shop.id, name: shop.name, type: 'credipay' });
      const qrPath = path.join(process.env.UPLOAD_PATH || './uploads', 'qr', `shop-${shop.id}.png`);
      const fs = require('fs');
      if (!fs.existsSync(path.dirname(qrPath))) fs.mkdirSync(path.dirname(qrPath), { recursive: true });
      await QRCode.toFile(qrPath, qrData);
      await shop.update({ credipay_qr_url: `/uploads/qr/shop-${shop.id}.png` });
    }

    // Notify shopkeeper
    await Notification.create({
      user_id: shop.owner_id,
      type: 'APPROVAL',
      title: `Shop ${status === 'APPROVED' ? 'Approved!' : 'Rejected'}`,
      message: status === 'APPROVED'
        ? 'Congratulations! Your shop is now live on CrediKart.'
        : `Your shop was rejected. Reason: ${reason || 'Did not meet requirements'}`,
    });

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shop status' });
  }
};

exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      where: { owner_id: req.user.id },
      include: [{ model: Product, as: 'products', required: false }],
    });
    if (!shop) return res.status(404).json({ error: 'No shop found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
};

exports.getShopAnalytics = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const { sequelize } = require('../models');
    const [stats] = await sequelize.query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        SUM(CASE WHEN status = 'DELIVERED' THEN total ELSE 0 END) as delivered_revenue,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_orders,
        SUM(CASE WHEN payment_method = 'CREDIPAY' THEN total ELSE 0 END) as credipay_revenue
      FROM orders WHERE shop_id = :shopId
    `, { replacements: { shopId: shop.id } });

    const [credipayReceivables] = await sequelize.query(`
      SELECT SUM(total_due - amount_paid) as pending_receivables
      FROM credipay_entries WHERE shop_id = :shopId AND status != 'PAID'
    `, { replacements: { shopId: shop.id } });

    res.json({
      ...stats[0],
      credipay_receivables: credipayReceivables[0]?.pending_receivables || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
