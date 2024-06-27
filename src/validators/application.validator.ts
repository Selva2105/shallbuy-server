const { body } = require('express-validator');

const applicationValidators = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email must be a valid email'),
  body('contact')
    .isMobilePhone()
    .withMessage('Contact must be a valid phone number'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Date of Birth must be a valid date'),
  body('yearOfGraduation')
    .notEmpty()
    .withMessage('Year of Graduation is required'),
  body('gender')
    .isIn(['Male', 'Female', 'Not_Willing_to_Disclose'])
    .withMessage('Invalid gender'),
  body('experienceInYears')
    .isIn([
      'LessThan1Year',
      'Between1And2Years',
      'Between2And3Years',
      'Between3And5Years',
      'MoreThan5Years',
    ])
    .withMessage('Invalid experience range'),
  body('currentEmployer')
    .notEmpty()
    .withMessage('Current Employer is required'),
  body('currentCTC')
    .isIn([
      'LessThan5LPA',
      'Between5And10LPA',
      'Between10And20LPA',
      'Between20And30LPA',
      'MoreThan30LPA',
    ])
    .withMessage('Invalid current CTC'),
  body('expectedCTC')
    .isIn([
      'LessThan5LPA',
      'Between5And10LPA',
      'Between10And20LPA',
      'Between20And30LPA',
      'MoreThan30LPA',
    ])
    .withMessage('Invalid expected CTC'),
  body('noticePeriod')
    .isIn(['Immediate', 'FifteenDays', 'OneMonth', 'TwoMonths', 'ThreeMonths'])
    .withMessage('Invalid notice period'),
  body('currentLocation')
    .notEmpty()
    .withMessage('Current Location is required'),
  body('preferredLocation')
    .isIn(['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai'])
    .withMessage('Invalid preferred location'),
  body('skillSet').isArray().withMessage('Skill Set must be an array'),
];

export default applicationValidators;
