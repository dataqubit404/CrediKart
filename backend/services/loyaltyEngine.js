const { User, LoyaltyTransaction, Notification, UserSubscription, SubscriptionPlan, sequelize } = require('../models');

const loyaltyEngine = {
  /**
   * Award points for a completed order
   */
  async awardPoints(order_id) {
    const { Order } = require('../models'); // lazy load to avoid circular dep
    const t = await sequelize.transaction();
    try {
      const order = await Order.findByPk(order_id, { transaction: t });
      if (!order) return;
      if (order.status !== 'DELIVERED' && order.status !== 'COLLECTED') return;

      // Avoid double awarding
      const existing = await LoyaltyTransaction.findOne({
        where: { user_id: order.customer_id, description: `Order #${order.id} bonus` },
        transaction: t
      });
      if (existing) {
        await t.rollback();
        return;
      }

      const subtotal = parseFloat(order.subtotal);
      
      // 1. Base Earning: 1 point per ₹100
      let points = Math.floor(subtotal / 100);
      let multiplier = 1;

      // 2. CrediPay Bonus: 2x
      if (order.payment_method === 'CREDIPAY') {
        multiplier *= 2;
      }

      // 3. Subscription Bonus: 2x if active
      const sub = await UserSubscription.findOne({
        where: { user_id: order.customer_id, is_active: true },
        transaction: t
      });
      if (sub) {
        multiplier *= 2;
      }

      const totalPoints = points * multiplier;

      if (totalPoints > 0) {
        // Update user balance
        await User.increment('loyalty_points', {
          by: totalPoints,
          where: { id: order.customer_id },
          transaction: t
        });

        // Create transaction log
        await LoyaltyTransaction.create({
          user_id: order.customer_id,
          amount: totalPoints,
          type: 'EARNED',
          description: `Order #${order.id} bonus`,
        }, { transaction: t });

        // Notify user
        await Notification.create({
          user_id: order.customer_id,
          type: 'SYSTEM',
          title: `You earned ${totalPoints} CrediPoints! 🏆`,
          message: `Thanks for shopping! You earned ${totalPoints} points for your order #${order.id}.`,
        }, { transaction: t });

        console.log(`[Loyalty] Awarded ${totalPoints} points to user ${order.customer_id} for order ${order.id}`);
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      console.error('[Loyalty] Award points error:', err);
    }
  }
};

module.exports = loyaltyEngine;
