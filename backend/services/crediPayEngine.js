const { CrediPayLedger, CrediPayEntry, CrediPayPayment, InterestRule, UserSubscription, SubscriptionPlan, Shop, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

const crediPayEngine = {

  // ── Create entry on new CrediPay order ───────────────────────────────────────
  async createEntry({ order, customer_id, platform_fee, transaction }) {
    let ledger = await CrediPayLedger.findOne({ where: { customer_id }, transaction });
    if (!ledger) {
      ledger = await CrediPayLedger.create({ customer_id, credit_limit: 5000 }, { transaction });
    }

    const rule = await InterestRule.findOne({ where: { is_active: true } });
    const free_days = rule?.free_days || 7;

    const due_date = new Date(order.created_at || new Date());
    due_date.setDate(due_date.getDate() + free_days);

    const total_due = parseFloat((parseFloat(order.subtotal) + parseFloat(platform_fee)).toFixed(2));

    const entry = await CrediPayEntry.create({
      ledger_id: ledger.id,
      order_id: order.id,
      shop_id: order.shop_id,
      principal: order.subtotal,
      platform_fee,
      total_due,
      due_date,
      status: 'PENDING',
    }, { transaction });

    await CrediPayLedger.increment(
      { total_due: total_due },
      { where: { id: ledger.id }, transaction }
    );

    return entry;
  },

  // ── Daily cron: accrue interest on overdue entries ───────────────────────────
  async accrueInterest() {
    const rule = await InterestRule.findOne({ where: { is_active: true } });
    if (!rule) { console.warn('[CrediPay] No active interest rule found'); return 0; }

    const now = new Date();

    const overdueEntries = await CrediPayEntry.findAll({
      where: {
        status: { [Op.in]: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        due_date: { [Op.lt]: now },
      },
      include: [{ model: CrediPayLedger, as: 'ledger' }],
    });

    let processed = 0;

    for (const entry of overdueEntries) {
      const lastCalc = entry.last_interest_calc || entry.due_date;
      const daysSinceLast = Math.floor((now - new Date(lastCalc)) / (1000 * 60 * 60 * 24));

      if (daysSinceLast < rule.interval_days) continue;

      // Check subscription discount
      let discount = 0;
      try {
        const sub = await UserSubscription.findOne({
          where: { user_id: entry.ledger.customer_id, is_active: true },
          include: [{ model: SubscriptionPlan, as: 'plan' }],
        });
        discount = parseFloat(sub?.plan?.interest_discount || 0);
      } catch (e) { /* ignore */ }

      const effectiveRate = Math.max(0, parseFloat(rule.overdue_rate) - discount);

      // Cap at max_rate
      const currentTotalInterestRate = parseFloat(entry.interest_due) / parseFloat(entry.principal);
      if (currentTotalInterestRate >= parseFloat(rule.max_rate)) continue;

      const interestCharge = parseFloat((parseFloat(entry.total_due) * effectiveRate).toFixed(2));

      await entry.increment('interest_due', { by: interestCharge });
      await entry.increment('total_due', { by: interestCharge });
      await entry.update({ status: 'OVERDUE', last_interest_calc: now });

      await CrediPayLedger.increment(
        { total_due: interestCharge, interest_accrued: interestCharge },
        { where: { id: entry.ledger_id } }
      );

      processed++;
    }

    console.log(`[CrediPay] Interest accrued on ${processed} entries`);
    return processed;
  },

  // ── Record payment request ──────────────────────────────────────────────────
  async recordPayment({ entry_id, customer_id, shopkeeper_id, amount, method, razorpay_id }) {
    const t = await sequelize.transaction();
    try {
      const payment = await CrediPayPayment.create({
        entry_id, customer_id, shopkeeper_id, amount,
        method,
        razorpay_id: razorpay_id || null,
        confirmed_by_shop: method === 'RAZORPAY',
      }, { transaction: t });

      if (method === 'RAZORPAY') {
        await this.finalizePayment(payment.id, t);
      }

      await t.commit();
      return payment;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  // ── Finalize payment (update entry and ledger) ──────────────────────────────
  async finalizePayment(payment_id, transaction = null) {
    const t = transaction || await sequelize.transaction();
    try {
      const payment = await CrediPayPayment.findByPk(payment_id, { transaction: t });
      if (!payment) throw new Error('Payment not found');

      const entry = await CrediPayEntry.findByPk(payment.entry_id, {
        include: [{ model: CrediPayLedger, as: 'ledger' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!entry) throw new Error('Entry not found');

      const amount = parseFloat(payment.amount);

      await entry.increment('amount_paid', { by: amount, transaction: t });
      await entry.reload({ transaction: t });

      // Update status
      const balance = parseFloat(entry.total_due) - parseFloat(entry.amount_paid);
      let newStatus = 'PARTIAL';
      if (balance <= 0.01) newStatus = 'PAID'; // ₹0.01 tolerance
      else if (new Date(entry.due_date) < new Date()) newStatus = 'OVERDUE';
      
      await entry.update({ 
        status: newStatus, 
        paid_at: newStatus === 'PAID' ? new Date() : entry.paid_at 
      }, { transaction: t });

      // Update ledger
      await CrediPayLedger.increment(
        { total_paid: amount },
        { where: { id: entry.ledger_id }, transaction: t }
      );
      await CrediPayLedger.decrement(
        { total_due: amount },
        { where: { customer_id: payment.customer_id }, transaction: t }
      );

      if (!transaction) await t.commit();
    } catch (err) {
      if (!transaction) await t.rollback();
      throw err;
    }
  },

  // ── Get full ledger summary for customer ─────────────────────────────────────
  async getLedgerSummary(customer_id) {
    const ledger = await CrediPayLedger.findOne({
      where: { customer_id },
      include: [{
        model: CrediPayEntry,
        as: 'entries',
        include: [
          { model: Shop, as: 'shop', attributes: ['id', 'name'] },
          { model: Order, as: 'order', attributes: ['id', 'created_at', 'total'] },
          { model: CrediPayPayment, as: 'payments' },
        ],
        order: [['created_at', 'DESC']],
      }],
    });

    if (!ledger) return null;

    const now = new Date();
    const total_due_num = parseFloat(ledger.total_due);
    const credit_limit_num = parseFloat(ledger.credit_limit);

    return {
      credit_limit: credit_limit_num,
      total_due: total_due_num,
      available_credit: parseFloat((credit_limit_num - total_due_num).toFixed(2)),
      interest_accrued: parseFloat(ledger.interest_accrued),
      total_paid: parseFloat(ledger.total_paid),
      utilization_pct: credit_limit_num > 0 ? ((total_due_num / credit_limit_num) * 100).toFixed(1) : '0',
      entries: (ledger.entries || []).map(e => ({
        id: e.id,
        order_id: e.order_id,
        shop: e.shop ? { id: e.shop.id, name: e.shop.name } : null,
        principal: parseFloat(e.principal),
        platform_fee: parseFloat(e.platform_fee),
        interest_due: parseFloat(e.interest_due),
        total_due: parseFloat(e.total_due),
        amount_paid: parseFloat(e.amount_paid),
        balance: parseFloat((e.total_due - e.amount_paid).toFixed(2)),
        status: e.status,
        due_date: e.due_date,
        paid_at: e.paid_at,
        is_overdue: new Date(e.due_date) < now && e.status !== 'PAID',
        days_overdue: e.status !== 'PAID' && new Date(e.due_date) < now
          ? Math.floor((now - new Date(e.due_date)) / (1000 * 60 * 60 * 24))
          : 0,
        payments: e.payments || [],
        created_at: e.created_at,
      })),
    };
  },
};

module.exports = crediPayEngine;
