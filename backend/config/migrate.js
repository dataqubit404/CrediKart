require('dotenv').config();
const sequelize = require('./database');
require('../models'); // load all models

async function migrate() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    console.log('🔄 Syncing models...');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models synced successfully');

    // Insert default interest rule
    const { InterestRule } = require('../models');
    const existing = await InterestRule.findOne();
    if (!existing) {
      await InterestRule.create({
        name: 'Default',
        free_days: parseInt(process.env.CREDIPAY_FREE_DAYS) || 7,
        base_rate: parseFloat(process.env.CREDIPAY_PLATFORM_FEE_RATE) || 0.028,
        overdue_rate: parseFloat(process.env.CREDIPAY_OVERDUE_RATE) || 0.005,
        interval_days: parseInt(process.env.CREDIPAY_INTERVAL_DAYS) || 7,
        max_rate: parseFloat(process.env.CREDIPAY_MAX_RATE) || 0.30,
        is_active: true,
      });
      console.log('✅ Default interest rule created');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
