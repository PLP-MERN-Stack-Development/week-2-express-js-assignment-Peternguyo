// server.js - Starter Express server for Week 2 assignment

// server.js
// Import required modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ValidationError, UnauthorizedError } = require('./error.js'); 

// Load environment variables from .env file
require('dotenv').config(); 

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Custome Logger Middleware 
app.use((req, res, next) => {
  console.log(` [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); })

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product


// Simple API Key auuthentication middleware 
const authenticateApiKey = (req, res, next) =>  {
  const apiKey = req.headers['x-api-key'];

  const SECRET_API_KEY = 'your-secret-api-key'; // Replace with your actual secret API key
  if (!apiKey || apiKey !== SECRET_API_KEY) {
    //return res.status(401).json({ error: 'Unauthorized' });
    throw new UnauthorizedError('Unauthorized;  Invalid or missing API key'); 
  }
  next(); //If API key is valid, proceed to the next middleware/route handler 
}; 


// Apply authentication middleware to all /api routes 
app.use('/api', authenticateApiKey); //Applies to all routes starting with /api  

// Example route implementation for GET /api/products
app.get('/api/products', authenticateApiKey, (req, res) => {
  let filteredProducts = [...products]; // start with all products (create a copy)

  //5.1 Filtering  by Category 
  const category = req.query.category; 
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }
  // ---advanced features --- 
  // SEARCH BY Name.
  
  const searchTerm = req.query.search;
  if (searchTerm){
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };
  
  // 5.2 Pagination
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default limit to 10
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Send back pagination metadata
  res.json({
    totalProducts: filteredProducts.length,
    currentPage: page,
    totalPages: Math.ceil(filteredProducts.length / limit),
    products: paginatedProducts
  });

  res.json(filteredProducts); 
}); 

//GET /api/products/stats - Get product statistics 
app.get(`/api/products/stats`, authenticateApiKey, (req, res, next) => {
  const stats = {}; 
  //count products by category 
  products.forEach(product => {
    const category = product.category.toLowerCase(); 
    stats[category] = (stats[category] || 0) + 1; 

    
  })
  
  // you can add more stats here, eg... total price, instock count 

    const inStockCount = products.filter(p => p.inStock).length; // Count products in stock 
    const totaValue = products.reduce((sum, p) => sum + (p.price * (p.inStock ? 1 : 0)), 0); 

    res.json({
      totalProducts: products.length,
      inStockCount: inStockCount,
      totalValue: totaValue,
      categoryCounts: stats 
  })
})

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

//GET /api/products/:id - Get a specific product by ID 
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id; // Get the ID from the URL
  const product = products.find(p => p.id === productId); // Find the product by ID 

  if (product) {
    res.json(product); //If found, send the product as JSON 

  }else {
    
    // Throw NotFoundError instead of res.status(404).send()
    throw new NotFoundError('Product not found.'); 
  }
})


// Validation middleware for creating/updating products 

const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  // Check if required fields are present 
  if (!name || typeof name !== 'string') {
    //return res.status(400).send('Name is required and must be a string.');
    throw new ValidationError('Name is required and must be a string.');
  }
  if (!description || typeof description !== 'string') {
    //return res.status (400).send('Description is required and must be a string.'); 
    throw new ValidationError('Description is required and must be a string.');
  } 
  if (typeof price != 'number' || price <= 0) {
    //return res.status(400).send('Price is required and must be a positive number.'); 
    throw new ValidationError('Price is required and must be a positive number.');
  }
  if (!category || typeof category !== 'string') {
    //return res.status(400).send('Category is required and must be a string.'); 
    throw new ValidationError('Category is required and must be a string.');
  }
  // inStock is optional for creation/update, but if provided, must be boolean
  if (typeof inStock != 'undefined' && typeof inStock != 'boolean') {
    //return res.status(400).send('inStock must be a boolean if provided.'); 
    throw new ValidationError('inStock must be a boolean if provided.');
  }
  next(); //if all validations pass, proceed to the next middleware/route handler
}

// POST /api/products - Create a new product
app.post('/api/products', authenticateApiKey, validateProduct, (req, res) => {
  const newProduct = req.body; // The data sent from the client is in req.body

  // Basic validation (more robust validation will be done with middleware in Task 3)
  if (!newProduct.name || !newProduct.price || !newProduct.category) {
    return res.status(400).send('Name, price, and category are required.');
  }

  // Generate a unique ID for the new product
  newProduct.id = uuidv4();
  // Ensure inStock is explicitly set or defaulted if not provided
  newProduct.inStock = typeof newProduct.inStock === 'boolean' ? newProduct.inStock : true;

  products.push(newProduct); // Add the new product to our in-memory array

  // Send back the created product with a 201 Created status
  res.status(201).json(newProduct);
}); 

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', authenticateApiKey, validateProduct, (req, res) => {
  const productId = req.params.id;
  const updatedProductData = req.body; // Data to update with

  const productIndex = products.findIndex(p => p.id === productId); // Find the index of the product

  if (productIndex !== -1) {
    // Update the product, preserving its original ID
    products[productIndex] = { ...products[productIndex], ...updatedProductData, id: productId };
    res.json(products[productIndex]); // Send back the updated product
  } else {
    throw new NotFoundError('Product not found.');
    //res.status(404).send('Product not found.'); // Product not found 
  }
}); 

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id; 

  const initialLength = products.length;
  // Filter out the product with the matching ID
  products = products.filter(p => p.id !== productId);

  if (products.length < initialLength) {
    // If a product was removed, send a 204 No Content status
    res.status(204).send(); // 204 means successful, but no content to send back
  } else {
    //res.status(404).send('Product not found.'); // Product not found
  }
}); 

// Global Error Handling Middleware (MUST be the last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Determine the status code and message based on the error type
  const statusCode = err.statusCode || 500; // Use custom status code if available, else 500
  const message = err.message || 'Something went wrong!'; // Use custom message, else generic

  res.status(statusCode).json({
    error: {
      message: message,
      type: err.name // Include the error type (e.g., NotFoundError, ValidationError)
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 



// Export the app for testing purposes
module.exports = app; 