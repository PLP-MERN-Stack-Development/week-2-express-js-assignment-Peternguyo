# Express.js RESTful API Assignment

This repository contains a RESTful API for managing product data, built with Express.js.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone YOUR_REPO_URL
    cd your-repo-name
    ```

2.  **Initialize Node.js Project:**
    ```bash
    npm init -y
    ```
    Add a `start` script to your `package.json` under the `"scripts"` section:
    ```json
    "scripts": {
      "start": "node server.js"
    },
    ```

3.  **Install Dependencies:**
    ```bash
    npm install express uuid
    ```
    *(Note: `body-parser` is no longer needed as `express.json()` is used.)*

4.  **Create `.env` file (for API Key):**
    Create a file named `.env` in the root of your project and add your secret API key:
    ```
    API_KEY=mysecretapikey123
    ```
    *(You'll also create a `.env.example` as required by the assignment, with `API_KEY=your_secret_key_here`)*

5.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3000`.

## API Endpoints Documentation

### 1. GET /api/products

* **Description:** Retrieves a list of all products. Supports filtering by category, searching by name, and pagination.
* **Request Headers:**
    * `x-api-key`: `mysecretapikey123` (Required for authentication)
* **Query Parameters (Optional):**
    * `category`: Filter products by category (e.g., `?category=electronics`)
    * `search`: Search products by name (case-insensitive, e.g., `?search=phone`)
    * `page`: Current page number for pagination (default: 1)
    * `limit`: Number of items per page for pagination (default: 10)
* **Success Response (200 OK):**
    ```json
    {
      "totalProducts": 3,
      "currentPage": 1,
      "totalPages": 1,
      "products": [
        {
          "id": "1",
          "name": "Laptop",
          "description": "High-performance laptop with 16GB RAM",
          "price": 1200,
          "category": "electronics",
          "inStock": true
        },
        // ... more products
      ]
    }
    ```
* **Error Responses:**
    * `401 Unauthorized`: If `x-api-key` is missing or invalid.
        ```json
        {
          "error": {
            "message": "Unauthorized: Invalid or missing API Key.",
            "type": "UnauthorizedError"
          }
        }
        ```
* **Example `curl` Request:**
    ```bash
    curl -H "x-api-key: mysecretapikey123" "http://localhost:3000/api/products?category=electronics&search=laptop"
    ```

### 2. GET /api/products/:id

* **Description:** Retrieves a single product by its unique ID.
* **Request Headers:**
    * `x-api-key`: `mysecretapikey123` (Required)
* **Success Response (200 OK):**
    ```json
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
    ```
* **Error Responses:**
    * `401 Unauthorized`: Invalid API Key.
    * `404 Not Found`: If product with the given ID does not exist.
        ```json
        {
          "error": {
            "message": "Product not found.",
            "type": "NotFoundError"
          }
        }
        ```
* **Example `curl` Request:**
    ```bash
    curl -H "x-api-key: mysecretapikey123" "http://localhost:3000/api/products/1"
    ```

... (continue for POST, PUT, DELETE, /api/products/stats) ...

## Middleware Implemented

* **Request Logger:** Logs the request method, URL, and timestamp for every incoming request.
* **JSON Body Parser:** `express.json()` is used to parse JSON payloads from incoming requests, making them available in `req.body`.
* **Authentication Middleware:** Checks for an `x-api-key` header. If invalid or missing, it prevents further processing and returns a `401 UnauthorizedError`.
* **Validation Middleware:** `validateProduct` ensures that `POST /api/products` and `PUT /api/products/:id` requests contain valid data (e.g., required fields, correct data types), returning a `400 ValidationError` if invalid.

## Error Handling

* **Global Error Handling:** A comprehensive error handling middleware is implemented at the end of `server.js` to catch all errors (thrown manually or implicitly). It logs the error stack and sends a standardized JSON error response with appropriate HTTP status codes and messages.
* **Custom Error Classes:**
    * `NotFoundError (404)`: Used when a requested resource is not found.
    * `ValidationError (400)`: Used when request data is invalid.
    * `UnauthorizedError (401)`: Used when authentication fails.

---