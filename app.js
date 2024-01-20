const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; // v 3.0
const apiUrl = 'http://makeup-api.herokuapp.com/api/v1/products.json';

app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch products
async function fetchProducts(queryParams) {
    const url = new URL(apiUrl);
    url.search = new URLSearchParams(queryParams).toString();
    const response = await axios.get(url.toString());
    return response.data;
}

// Single endpoint for fetching products with optional brand, product_type, and name filters
app.get('/api/products', async (req, res, next) => {
    try {
        const { brand, product_type, name } = req.query;
        const queryParams = {};
        if (brand) queryParams.brand = brand;
        if (product_type) queryParams.product_type = product_type;

        let products = await fetchProducts(queryParams);
        if (name) {
            const nameLower = name.toLowerCase();
            products = products.filter(product => product.name.toLowerCase().includes(nameLower));
        }
        if (products.length === 0) {
            res.json({ message: 'No products found' });
        } else {
            res.json(products);
        }
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});