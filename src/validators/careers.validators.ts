const { body } = require('express-validator');

const careersValidator = [
  body('jobGroup')
    .exists()
    .isIn([
      'Design',
      'Developer',
      'Management',
      'Customer_Success',
      'Marketing',
    ])
    .withMessage('Invalid job group'),
  body('jobHeading')
    .exists()
    .isString()
    .withMessage('Job heading must be a string')
    .custom((value: any, { req }: any) => {
      const validHeadings = {
        Design: ['UX Designer', 'Product Designer'],
        Developer: [
          'Fullstack developer',
          'Frontend developer',
          'Backend developer',
        ],
        Management: ['Human Resource Manager'],
        Customer_Success: ['Customer Success Manager'],
        Marketing: ['Digital Marketing Specialist'],
      } as { [key: string]: string[] };
      if (!validHeadings[req.body.jobGroup]?.includes(value)) {
        throw new Error('Invalid job heading for the specified job group');
      }
      return true;
    }),
  body('description')
    .exists()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('jobPoints')
    .optional()
    .isArray()
    .withMessage('Job points must be an array of strings'),
  body('location')
    .exists()
    .isIn(['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai'])
    .withMessage('Invalid location'),
  body('salary')
    .exists()
    .isIn([
      'LessThan5LPA',
      'Between5And10LPA',
      'Between10And20LPA',
      'Between20And30LPA',
      'MoreThan30LPA',
    ])
    .withMessage('Invalid salary range'),
  body('jobType')
    .exists()
    .isIn(['FullTime', 'PartTime', 'Freelance'])
    .withMessage('Invalid job type'),
];

export default careersValidator;
