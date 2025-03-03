const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const MenuItem = require('./models/MenuItem');

dotenv.config();
const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(express.json());
app.use(cors());

// Check if MONGO_URI is provided
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env file.');
    process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Default route to avoid "Cannot GET /" error
app.get('/', (req, res) => {
    res.send('🚀 API is running! Use /menu for CRUD operations.');
});

// Create a Menu Item
app.post('/menu', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || price == null) {
            return res.status(400).json({ error: '❌ Name and Price are required' });
        }

        const newItem = new MenuItem({ name, description, price });
        await newItem.save();
        res.status(201).json({ message: '✅ Menu item created', data: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Menu Items
app.get('/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json({ message: '✅ Menu items retrieved', data: menuItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an Existing Menu Item
app.put('/menu/:id', async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ error: '❌ Menu item not found' });
        }

        res.status(200).json({ message: '✅ Menu item updated', data: updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Menu Item
app.delete('/menu/:id', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ error: '❌ Menu item not found' });
        }

        res.status(200).json({ message: '✅ Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
