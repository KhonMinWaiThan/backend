const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Import User model
const Product = require('./models/Product'); // Import Product model

require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000; // Define the port number

// MongoDB connection string from environment variable
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected to paws-mart database'))
.catch(err => console.error('MongoDB connection error:', err));

// User registration route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });
        
        // Successful login, return user info or token (in a real-world scenario)
        res.status(200).json({ message: 'Login successful!', user }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch products from MongoDB
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch product by ID
app.get('/api/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Fetch product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product); // Return the product data
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to update user shipping address
app.put('/api/user/address', async (req, res) => {
    const { userId, address } = req.body; // Assuming an object { userId, address }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.shippingAddresses.push(address); // Add new address
        await user.save();
        res.status(200).json({ message: "Shipping address added successfully!", shippingAddresses: user.shippingAddresses });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
