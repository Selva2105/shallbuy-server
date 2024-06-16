import { body } from 'express-validator';

export const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('quantity')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),
];
