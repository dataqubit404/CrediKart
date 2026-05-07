const { User, LoyaltyTransaction } = require('../models');

exports.getLoyaltyInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['loyalty_points', 'membership_tier', 'referral_code']
    });

    const transactions = await LoyaltyTransaction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20
    });

    // Calculate progress to next tier
    let nextTier = null;
    let pointsNeeded = 0;
    let progress = 0;

    if (user.membership_tier === 'BRONZE') { nextTier = 'SILVER'; pointsNeeded = 500; }
    else if (user.membership_tier === 'SILVER') { nextTier = 'GOLD'; pointsNeeded = 2000; }
    else if (user.membership_tier === 'GOLD') { nextTier = 'PLATINUM'; pointsNeeded = 5000; }

    if (nextTier) {
        const currentPoints = user.loyalty_points;
        const prevThreshold = nextTier === 'SILVER' ? 0 : (nextTier === 'GOLD' ? 500 : 2000);
        progress = Math.min(100, Math.max(0, ((currentPoints - prevThreshold) / (pointsNeeded - prevThreshold)) * 100));
    }

    res.json({
      loyalty_points: user.loyalty_points,
      membership_tier: user.membership_tier,
      referral_code: user.referral_code,
      transactions,
      next_tier: nextTier,
      points_needed: pointsNeeded,
      progress: Math.round(progress)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loyalty data' });
  }
};
