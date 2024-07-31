const { body } = require('express-validator');

const orderProductValidators = [
  body('address.street').notEmpty().withMessage('Please enter the street name'),
  body('address.city').notEmpty().withMessage('Please enter the city name'),
  body('address.district')
    .notEmpty()
    .withMessage('Please enter the district name'),
  body('address.state').notEmpty().withMessage('Please enter the state name'),
  body('address.country')
    .notEmpty()
    .withMessage('Please enter the country name'),
  body('address.pincode')
    .notEmpty()
    .isPostalCode('IN')
    .withMessage('Please enter a valid pincode'),
  body('name').notEmpty().withMessage('Please enter the name'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Please enter the phone number')
    .isLength({ min: 10, max: 10 })
    .withMessage('Please enter a valid 10-digit phone number'),
  body('email').email().withMessage('Please enter the valid email'),
  body('deliveryInstruction').optional(),
  body('products')
    .isArray({ min: 1 })
    .withMessage('Please choose the products before proceeding to the order'),
];
export default orderProductValidators;
