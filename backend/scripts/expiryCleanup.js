const { Product } = require('./models');
const { Op } = require('sequelize');

async function cleanup() {
  try {
    console.log('[Cleanup] Starting expiry cleanup...');
    const now = new Date();
    
    // Deactivate products where expiry_date has passed
    const expiredCount = await Product.update(
      { is_active: false },
      { 
        where: { 
          expiry_date: { [Op.lt]: now },
          is_active: true
        } 
      }
    );

    // End flash sales that have passed their timer
    const flashEndCount = await Product.update(
      { is_flash_sale: false },
      {
        where: {
          is_flash_sale: true,
          flash_ends_at: { [Op.lt]: now }
        }
      }
    );

    console.log(`[Cleanup] Successfully deactivated ${expiredCount} expired products.`);
    console.log(`[Cleanup] Successfully ended ${flashEndCount} flash sales.`);
    process.exit(0);
  } catch (err) {
    console.error('[Cleanup] Error during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
