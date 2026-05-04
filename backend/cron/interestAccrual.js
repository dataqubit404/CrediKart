const cron = require('node-cron');
const crediPayEngine = require('../services/crediPayEngine');
const { User, CrediPayLedger, CrediPayEntry, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendPaymentReminder } = require('../services/mailer');

// Daily at 00:05 AM – accrue interest on overdue entries
cron.schedule('5 0 * * *', async () => {
  console.log('[CRON] Starting daily interest accrual...');
  try {
    const count = await crediPayEngine.accrueInterest();
    console.log(`[CRON] Done. Charged interest on ${count} entries.`);
  } catch (err) {
    console.error('[CRON] Interest accrual failed:', err.message);
  }
});

// Daily at 09:00 AM – send payment reminders for entries due in 2 days
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Sending payment reminders...');
  try {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const upcomingDue = await CrediPayEntry.findAll({
      where: {
        status: { [Op.in]: ['PENDING', 'PARTIAL'] },
        due_date: { [Op.between]: [new Date(), twoDaysFromNow] },
      },
      include: [{
        model: CrediPayLedger,
        as: 'ledger',
        include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }],
      }],
    });

    for (const entry of upcomingDue) {
      const customer = entry.ledger?.customer;
      const balance = parseFloat(entry.total_due) - parseFloat(entry.amount_paid);

      // 1. Email Reminder
      if (customer?.email) {
        await sendPaymentReminder(customer.email, customer.name, balance.toFixed(2), entry.due_date);
      }

      // 2. In-App Notification
      await Notification.create({
        user_id: entry.ledger.customer_id,
        type: 'CREDIT',
        title: 'Payment Due Soon ⏰',
        message: `Your payment of ₹${balance.toFixed(2)} is due on ${new Date(entry.due_date).toDateString()}. Pay now to avoid interest charges!`,
        data: { entry_id: entry.id, amount: balance }
      });
    }
    console.log(`[CRON] Sent ${upcomingDue.length} payment reminders`);
  } catch (err) {
    console.error('[CRON] Reminder failed:', err.message);
  }
});

// Monthly on 1st – expire subscriptions
cron.schedule('0 2 1 * *', async () => {
  console.log('[CRON] Checking subscription expiries...');
  try {
    const { UserSubscription, Shop } = require('../models');
    const expired = await UserSubscription.findAll({
      where: { is_active: true, ends_at: { [Op.lt]: new Date() } },
    });
    for (const sub of expired) {
      await sub.update({ is_active: false });
      await Shop.update({ is_featured: false }, { where: { owner_id: sub.user_id } });
      console.log(`[CRON] Expired subscription for user ${sub.user_id}`);
    }
  } catch (err) {
    console.error('[CRON] Subscription expiry failed:', err.message);
  }
});

console.log('[CRON] All cron jobs registered.');
