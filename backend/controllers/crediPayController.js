const { User, CrediPayLedger, CrediPayEntry, CrediPayPayment, Shop, Order, Notification, InterestRule } = require('../models');
const crediPayEngine = require('../services/crediPayEngine');
const { Op } = require('sequelize');

exports.getMyLedger = async (req, res) => {
  try {
    const summary = await crediPayEngine.getLedgerSummary(req.user.id);
    if (!summary) {
      // Create ledger if doesn't exist
      await CrediPayLedger.create({ customer_id: req.user.id, credit_limit: req.user.credit_limit });
      return res.json(await crediPayEngine.getLedgerSummary(req.user.id));
    }
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
};

exports.getMyEntries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const ledger = await CrediPayLedger.findOne({ where: { customer_id: req.user.id } });
    if (!ledger) return res.json({ entries: [] });

    const where = { ledger_id: ledger.id };
    if (status) where.status = status;

    const entries = await CrediPayEntry.findAndCountAll({
      where,
      include: [
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: Order, as: 'order', attributes: ['id', 'total', 'created_at'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ entries: entries.rows, total: entries.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

exports.getReceivables = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const entries = await CrediPayEntry.findAll({
      where: { shop_id: shop.id, status: { [Op.ne]: 'PAID' } },
      include: [
        { 
          model: CrediPayLedger, 
          as: 'ledger', 
          include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'phone'] }] 
        },
        { model: Order, as: 'order', attributes: ['id', 'created_at'] },
        { model: CrediPayPayment, as: 'payments' },
      ],
      order: [['due_date', 'ASC']],
    });

    const total_receivable = entries.reduce((sum, e) => sum + parseFloat(e.total_due) - parseFloat(e.amount_paid), 0);

    res.json({ entries, total_receivable: total_receivable.toFixed(2) });
  } catch (err) {
    console.error('Get receivables error:', err);
    res.status(500).json({ error: 'Failed to fetch receivables' });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { entry_id, amount, method } = req.body;

    const entry = await CrediPayEntry.findByPk(entry_id, {
      include: [{ model: CrediPayLedger, as: 'ledger' }],
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.ledger.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const balance = parseFloat(entry.total_due) - parseFloat(entry.amount_paid);
    if (parseFloat(amount) > balance) {
      return res.status(400).json({ error: `Amount exceeds outstanding balance of ₹${balance.toFixed(2)}` });
    }

    const payment = await crediPayEngine.recordPayment({
      entry_id,
      customer_id: req.user.id,
      shopkeeper_id: (await Shop.findByPk(entry.shop_id)).owner_id,
      amount: parseFloat(amount),
      method: method || 'QR_CASH',
    });

    // Notify shopkeeper to confirm
    const shop = await Shop.findByPk(entry.shop_id);
    await Notification.create({
      user_id: shop.owner_id,
      type: 'PAYMENT',
      title: 'Payment Received - Confirm Required',
      message: `Customer paid ₹${amount} for Order #${entry.order_id}. Please confirm.`,
      data: { payment_id: payment.id, entry_id },
    });

    res.json({ success: true, payment_id: payment.id, message: 'Payment recorded. Awaiting shopkeeper confirmation.' });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await CrediPayPayment.findByPk(req.params.id, {
      include: [{ model: CrediPayEntry, as: 'entry' }],
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const shop = await Shop.findOne({ where: { owner_id: req.user.id, id: payment.entry.shop_id } });
    if (!shop) return res.status(403).json({ error: 'Access denied' });

    await payment.update({ confirmed_by_shop: true });
    await crediPayEngine.finalizePayment(payment.id);

    // Notify customer
    await Notification.create({
      user_id: payment.customer_id,
      type: 'PAYMENT',
      title: 'Payment Confirmed!',
      message: `Your payment of ₹${payment.amount} has been confirmed by ${shop.name}.`,
    });

    res.json({ success: true, message: 'Payment confirmed' });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

exports.triggerInterestCalc = async (req, res) => {
  try {
    const count = await crediPayEngine.accrueInterest();
    res.json({ success: true, processed: count, message: `Interest accrued on ${count} overdue entries` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate interest' });
  }
};

exports.getInterestRules = async (req, res) => {
  try {
    const rules = await InterestRule.findAll();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

exports.updateInterestRules = async (req, res) => {
  try {
    const { free_days, overdue_rate, interval_days, max_rate } = req.body;
    const rule = await InterestRule.findOne({ where: { is_active: true } });
    await rule.update({ free_days, overdue_rate, interval_days, max_rate });
    res.json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rules' });
  }
};
