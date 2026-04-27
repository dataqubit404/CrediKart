const { SubscriptionPlan, UserSubscription, User, Shop, CrediPayLedger, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getPlans = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { is_active: true };
    if (type) where.type = type;
    const plans = await SubscriptionPlan.findAll({ where });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { plan_id, billing_cycle = 'MONTHLY' } = req.body;
    const plan = await SubscriptionPlan.findByPk(plan_id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Check role match
    const roleMap = { CUSTOMER: 'CUSTOMER', SHOPKEEPER: 'SHOPKEEPER' };
    if (plan.type !== roleMap[req.user.role]) {
      return res.status(400).json({ error: `This plan is for ${plan.type.toLowerCase()}s only` });
    }

    // Deactivate existing subscription
    await UserSubscription.update(
      { is_active: false },
      { where: { user_id: req.user.id, is_active: true } }
    );

    const starts_at = new Date();
    const ends_at = new Date();
    if (billing_cycle === 'YEARLY') ends_at.setFullYear(ends_at.getFullYear() + 1);
    else ends_at.setMonth(ends_at.getMonth() + 1);

    const sub = await UserSubscription.create({
      user_id: req.user.id,
      plan_id,
      starts_at,
      ends_at,
      is_active: true,
      billing_cycle,
    });

    // Apply benefits
    if (plan.type === 'CUSTOMER' && plan.credit_limit) {
      await User.update({ credit_limit: plan.credit_limit }, { where: { id: req.user.id } });
      await CrediPayLedger.update({ credit_limit: plan.credit_limit }, { where: { customer_id: req.user.id } });
    }

    if (plan.type === 'SHOPKEEPER') {
      const benefits = plan.benefits || [];
      const isFeatured = benefits.includes('Featured badge') || benefits.some(b => b.toLowerCase().includes('featured'));
      if (isFeatured) {
        await Shop.update({ is_featured: true }, { where: { owner_id: req.user.id } });
      }
    }

    await Notification.create({
      user_id: req.user.id,
      type: 'SUBSCRIPTION',
      title: `Subscribed to ${plan.name}!`,
      message: `Your ${plan.name} subscription is active until ${ends_at.toDateString()}.`,
    });

    res.status(201).json({ success: true, subscription: sub, plan });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({
      where: { user_id: req.user.id, is_active: true },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
    });
    res.json(sub || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const sub = await UserSubscription.findOne({ where: { user_id: req.user.id, is_active: true } });
    if (!sub) return res.status(404).json({ error: 'No active subscription' });

    await sub.update({ is_active: false });
    // Revert featured status
    await Shop.update({ is_featured: false }, { where: { owner_id: req.user.id } });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await plan.update(req.body);
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
};
