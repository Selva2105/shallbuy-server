const { body } = require('express-validator');

const conatctFormValidators = {
  validateFormFields: [
    body('name').isString(),
    body('email').isEmail(),
    body('subject').isString(),
    body('message').isString(),
  ],
};

export default conatctFormValidators;
