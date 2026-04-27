const { User, Order, Shop, DeliveryAssignment, Notification } = require('../models');
const { Op } = require('sequelize');

exports.toggleAvailability = async (req, res) => {
  try {
    await req.user.update({ is_available: !req.user.is_available });
    res.json({ success: true, is_available: !req.user.is_available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

exports.getAvailableOrders = async (req, res) => {
  try {
    const unassigned = await Order.findAll({
      where: { delivery_type: 'DELIVERY', status: 'CONFIRMED' },
      include: [
        { model: Shop, as: 'shop', attributes: ['name', 'address', 'lat', 'lng'] },
        {
          model: DeliveryAssignment, as: 'delivery',
          required: false,
          where: { id: null },
        },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(unassigned);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || order.status !== 'CONFIRMED' || order.delivery_type !== 'DELIVERY') {
      return res.status(400).json({ error: 'Order not available for delivery' });
    }

    const existing = await DeliveryAssignment.findOne({ where: { order_id: order.id } });
    if (existing) return res.status(400).json({ error: 'Order already assigned' });

    const assignment = await DeliveryAssignment.create({
      order_id: order.id,
      partner_id: req.user.id,
      status: 'ASSIGNED',
      earned: 30, // flat delivery earning
    });

    await order.update({ status: 'OUT_FOR_DELIVERY' });

    await Notification.create({
      user_id: order.customer_id,
      type: 'ORDER',
      title: 'Order Out for Delivery!',
      message: 'Your order is on the way!',
    });

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept order' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await DeliveryAssignment.findOne({
      where: { id: req.params.id, partner_id: req.user.id },
    });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    await assignment.update({
      status,
      delivered_at: status === 'DELIVERED' ? new Date() : null,
    });

    if (status === 'DELIVERED') {
      await Order.update({ status: 'DELIVERED' }, { where: { id: assignment.order_id } });
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.findAll({
      where: { partner_id: req.user.id },
      include: [{ model: Order, as: 'order', include: [{ model: Shop, as: 'shop', attributes: ['name', 'address'] }] }],
      order: [['assigned_at', 'DESC']],
    });

    const totalEarned = assignments
      .filter(a => a.status === 'DELIVERED')
      .reduce((sum, a) => sum + parseFloat(a.earned), 0);

    res.json({ assignments, total_earned: totalEarned.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};
