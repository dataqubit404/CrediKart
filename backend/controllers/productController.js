const { Product, Shop } = require('../models');
const { Op } = require('sequelize');

exports.getProducts = async (req, res) => {
  try {
    const { shop_id, category, q, page = 1, limit = 40, sort = 'name' } = req.query;
    const where = { is_active: true };

    if (shop_id) where.shop_id = shop_id;
    if (category) where.category = category;
    if (q) where.name = { [Op.like]: `%${q}%` };

    const sortMap = { name: ['name', 'ASC'], price_asc: ['price', 'ASC'], price_desc: ['price', 'DESC'] };
    const order = sortMap[sort] || ['name', 'ASC'];

    const products = await Product.findAndCountAll({
      where,
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'status'], where: { status: 'APPROVED' } }],
      order: [order],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ products: products.rows, total: products.count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'rating'] }],
    });
    if (!product || !product.is_active) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { owner_id: req.user.id, status: 'APPROVED' } });
    if (!shop) return res.status(403).json({ error: 'Approved shop required to add products' });

    const { name, description, price, mrp, stock, unit, category } = req.body;
    const image_url = req.file ? `/uploads/image/${req.file.filename}` : null;

    const product = await Product.create({
      shop_id: shop.id, name, description,
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : null,
      stock: parseInt(stock) || 0,
      unit, category, image_url,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    const product = await Product.findOne({ where: { id: req.params.id, shop_id: shop?.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const updates = {};
    const allowed = ['name', 'description', 'price', 'mrp', 'stock', 'unit', 'category', 'is_active'];
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (req.file) updates.image_url = `/uploads/image/${req.file.filename}`;

    await product.update(updates);
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    const product = await Product.findOne({ where: { id: req.params.id, shop_id: shop?.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ is_active: false });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { shop_id } = req.query;
    const where = { is_active: true };
    if (shop_id) where.shop_id = shop_id;

    const cats = await Product.findAll({
      where,
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('category')), 'category']],
      raw: true,
    });
    res.json(cats.map(c => c.category).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
