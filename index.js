// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User'); // Ensure these models are defined
const Product = require('./models/Product'); 

dotenv.config(); // Load environment variables

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Define trusted origins here. Replace with your front-end URL in production.
    const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection string from environment variable
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to paws-mart database'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    // Successful login, return user info or token (in a real-world scenario)
    res.status(200).json({ success: true, message: 'Login successful!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to fetch product by ID
app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to update user shipping address
app.put('/api/user/address', async (req, res) => {
  const { userId, address } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.shippingAddresses.push(address);
    await user.save();
    res.status(200).json({ success: true, message: "Shipping address added successfully!", shippingAddresses: user.shippingAddresses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
