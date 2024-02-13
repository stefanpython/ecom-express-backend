# Ecom-express Backend API

This is the backend API for a personal e-commerce website. This API serves as the backbone for managing users, products, orders, payments, addresses, and more. It provides a set of endpoints for various functionalities required to run an e-commerce platform.

### Features

- User Management: Register, log in, and manage user accounts.
- Product Management: Add, update, and delete products.
- Order Management: Create, update, and view orders.
- Cart Management: Add, remove, and view products in the cart.
- Address Management: Add, update, and delete user addresses.
- Payment Integration: Handle payments for orders.
- Review System: Allow users to review products.
- Authentication & Authorization: Secure endpoints using JWT authentication.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Install dependencies:
   ```
   cd ecom-express-backend
   npm install
   ```
3. Set up environment variables:
   ```
   Create a .env file in the root directory and configure environment variables such as database connection URI, JWT secret, and SMTP server details.
   ```
4. Run the server:
   ```
   npm start
   ```

### Usage

Once the server is running, you can make HTTP requests to the provided endpoints using your preferred tool (e.g., Postman, cURL). Make sure to authenticate where necessary using JWT tokens.
