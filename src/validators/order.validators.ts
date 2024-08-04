import { body } from 'express-validator';

export const createOrderValidator = [
  body('total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number'),
  body('shippingAddressId')
    .isString()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('paymentMethod')
    .isIn([
      'CREDIT_CARD',
      'DEBIT_CARD',
      'PAYPAL',
      'BANK_TRANSFER',
      'CASH_ON_DELIVERY',
    ])
    .withMessage('Invalid payment method'),
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  body('products.*.productId')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('products.*.price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('products.*.sellerId')
    .isString()
    .notEmpty()
    .withMessage('Seller ID is required'),
];
