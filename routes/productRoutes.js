const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Jo model abhi banaya tha

// 1. GET ALL PRODUCTS
// URL: http://localhost:5000/api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Products nahi mil rahe!", error: err.message });
  }
});

// 2. CREATE A PRODUCT (Testing ke liye)
// URL: http://localhost:5000/api/products
router.post('/', async (req, res) => {
  const { name, description, price, originalPrice, category, images, video, stock } = req.body;

  const newProduct = new Product({
    name,
    description,
    price,
    originalPrice,
    category,
    images,
    video,
    stock
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: "Product save nahi hua!", error: err.message });
  }
});

module.exports = router;