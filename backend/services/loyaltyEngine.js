const { User, LoyaltyTransaction, Notification, UserSubscription, SubscriptionPlan, CrediPayLedger, sequelize } = require('../models');

const loyaltyEngine = {
  /**
   * Award points for a completed order
   */
  async awardPoints(order_id) {
      const { Order, OrderItem } = require('../models'); // lazy load
      const t = await sequelize.transaction();
      try {
        const order = await Order.findByPk(order_id, { transaction: t });
        if (!order) return;
        if (order.status !== 'DELIVERED' && order.status !== 'COLLECTED') return;

        // --- Part 6: Waste Warrior Bonus Calculation ---
        let flashItemsCount = 0;
        const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction: t });
        for (const item of orderItems) {
            if (item.is_flash_sale) flashItemsCount += item.qty;
        }

        const subtotal = parseFloat(order.subtotal);
        
        // 1. Base Earning: 1 point per ₹100
        let points = Math.floor(subtotal / 100);
        let multiplier = 1;

        // 2. Bonus Multipliers
        if (order.payment_method === 'CREDIPAY') multiplier *= 2;
        const sub = await UserSubscription.findOne({ where: { user_id: order.customer_id, is_active: true }, transaction: t });
        if (sub) multiplier *= 2;

        let totalPoints = points * multiplier;
        
        // 3. Add Waste Warrior Fixed Bonus
        const wasteBonus = flashItemsCount * 10; 
        totalPoints += wasteBonus;

        if (totalPoints > 0) {
          await User.increment('loyalty_points', { by: totalPoints, where: { id: order.customer_id }, transaction: t });
          await LoyaltyTransaction.create({
            user_id: order.customer_id,
            amount: totalPoints,
            type: 'EARNED',
            description: flashItemsCount > 0 ? `Order #${order.id} (incl. Waste Warrior bonus)` : `Order #${order.id} bonus`,
          }, { transaction: t });

        // --- Part 5: Membership Tier Upgrade Logic ---
        const updatedUser = await User.findByPk(order.customer_id, { transaction: t });
        let newTier = 'BRONZE';
        if (updatedUser.loyalty_points >= 5000) newTier = 'PLATINUM';
        else if (updatedUser.loyalty_points >= 2000) newTier = 'GOLD';
        else if (updatedUser.loyalty_points >= 500) newTier = 'SILVER';

        if (newTier !== updatedUser.membership_tier) {
          await updatedUser.update({ membership_tier: newTier }, { transaction: t });
          await Notification.create({
            user_id: order.customer_id,
            type: 'SYSTEM',
            title: `Level Up! You are now ${newTier} 🎖️`,
            message: `Congratulations! You've been promoted to the ${newTier} tier. Unlock better rewards and higher limits now!`,
          }, { transaction: t });
        }

        // Notify user about points
        await Notification.create({
          user_id: order.customer_id,
          type: 'SYSTEM',
          title: `You earned ${totalPoints} CrediPoints! 🏆`,
          message: `Thanks for shopping! You earned ${totalPoints} points for your order #${order.id}.`,
        }, { transaction: t });

        console.log(`[Loyalty] Awarded ${totalPoints} points to user ${order.customer_id} for order ${order.id}`);
      }

      // --- Part 4: Referral Rewards ---
      // Check if this is the customer's first completed order
      const completedCount = await Order.count({
        where: { customer_id: order.customer_id, status: ['DELIVERED', 'COLLECTED'] },
        transaction: t
      });

      if (completedCount === 1) { // This was their first one!
        const user = await User.findByPk(order.customer_id, { transaction: t });
        if (user.referred_by_id) {
          const referrerId = user.referred_by_id;
          const refereeId = user.id;
          
          const BONUS_CREDIT = 500;
          const BONUS_POINTS = 50;

          // 1. Reward Referrer
          await User.increment({ loyalty_points: BONUS_POINTS, credit_limit: BONUS_CREDIT }, { where: { id: referrerId }, transaction: t });
          await CrediPayLedger.increment('credit_limit', { by: BONUS_CREDIT, where: { customer_id: referrerId }, transaction: t });
          await LoyaltyTransaction.create({ user_id: referrerId, amount: BONUS_POINTS, type: 'REFERRAL_BONUS', description: `Referral bonus for inviting ${user.name}` }, { transaction: t });
          await Notification.create({ user_id: referrerId, type: 'CREDIT', title: 'Referral Bonus! 🎁', message: `Your friend ${user.name} made their first purchase! You earned ₹${BONUS_CREDIT} credit and ${BONUS_POINTS} points.` }, { transaction: t });

          // 2. Reward Referee (The current customer)
          await User.increment({ loyalty_points: BONUS_POINTS, credit_limit: BONUS_CREDIT }, { where: { id: refereeId }, transaction: t });
          await CrediPayLedger.increment('credit_limit', { by: BONUS_CREDIT, where: { customer_id: refereeId }, transaction: t });
          await LoyaltyTransaction.create({ user_id: refereeId, amount: BONUS_POINTS, type: 'REFERRAL_BONUS', description: `Welcome bonus for using referral code` }, { transaction: t });
          await Notification.create({ user_id: refereeId, type: 'CREDIT', title: 'Welcome Bonus! 🎁', message: `Since you joined via invite, you earned a ₹${BONUS_CREDIT} credit limit increase and ${BONUS_POINTS} bonus points!` }, { transaction: t });

          console.log(`[Loyalty] Referral bonus processed for referrer ${referrerId} and referee ${refereeId}`);
        }
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      console.error('[Loyalty] Award points error:', err);
    }
  }
};

module.exports = loyaltyEngine;
