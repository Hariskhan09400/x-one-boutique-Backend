const { Client } = require('pg');

// TERA CONNECTION STRING (Already Working)
const connectionString = "postgresql://postgres:SUPADATABAS@db.oaonaiocrkujucaepefk.supabase.co:5432/postgres";

const client = new Client({ connectionString });

// 🛍️ NAYA MAAL (New Products Added)
const products = [
  { name: "Premium Cotton Shirt", price: 1299, description: "White cotton shirt", category: "Clothing", stock: 50 },
  { name: "Gaming Laptop Pro", price: 75000, description: "Fastest laptop", category: "Electronics", stock: 10 },
  { name: "Wireless Earbuds", price: 2500, description: "Noise cancelling", category: "Electronics", stock: 100 },
  { name: "Luxury Watch", price: 4500, description: "Elegant silver watch", category: "Accessories", stock: 20 },
  { name: "Designer Kurta", price: 3200, description: "Hand-stitched ethnic wear", category: "Clothing", stock: 15 }
];

async function seedDB() {
  try {
    console.log("Supabase se connect ho raha hai... ⏳");
    await client.connect();

    // Table create karna (Agar nahi hai toh ban jayegi)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        category TEXT,
        stock INTEGER DEFAULT 0
      );
    `);

    await client.query('DELETE FROM products'); 
    console.log("Purana data saaf! 🧹");

    for (let p of products) {
      await client.query(
        'INSERT INTO products (name, price, description, category, stock) VALUES ($1, $2, $3, $4, $5)',
        [p.name, p.price, p.description, p.category, p.stock]
      );
    }

    console.log("Maal Load Ho Gaya! 📦✅ (Supabase Version)");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("Error ❌:", err.message);
    process.exit(1);
  }
}

seedDB();