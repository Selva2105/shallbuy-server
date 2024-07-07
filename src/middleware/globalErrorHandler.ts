import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import CustomError from '../utils/customError';

/**
 * Handle development environment errors.
 *
 * @param {Object} res - Express response object.
 * @param {Object} error - CustomError object.
 */
const devErrors = (res: Response, error: CustomError): void => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error,
  });
};

/**
 * Handle production environment errors.
 *
 * @param {Object} res - Express response object.
 * @param {Object} error - CustomError object.
 */
const productionError = (res: Response, error: CustomError): void => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * Handle duplicate key error and convert it into a CustomError.
 *
 * @param {Object} err - MongoDB duplicate key error.
 * @returns {CustomError} - CustomError object with a specific error message.
 */
const duplicateKeyErrorHandler = (err: any): CustomError => {
  let msg: string;
  if (err.keyValue.username) {
    msg = `There is already a product with name: ${err.keyValue.username} exists.`;
  } else if (err.keyValue.email) {
    msg = `There is already a user with email ${err.keyValue.email} exists.`;
  } else if (
    Object.prototype.hasOwnProperty.call(err.keyValue, 'phoneNumber.Number')
  ) {
    msg = `There is already a user with Phone number ${err.keyValue['phoneNumber.Number']} exists.`;
  } else {
    msg = 'Duplicate key error, but specific field is missing.';
  }
  return new CustomError(msg, 400);
};

/**
 * Handle validation errors and convert them into a CustomError.
 *
 * @param {Object} err - MongoDB validation error.
 * @returns {CustomError} - CustomError object with a specific error message.
 */
const validationErrorHandler = (err: any): CustomError => {
  const errors = Object.values(err.error).map((val: any) => ({
    message: val.msg,
    value: val.value,
  }));
  const errorMessages = errors
    .map((error: any) => `${error.message} (${error.value})`)
    .join(', ');
  const msg = `Invalid input data: ${errorMessages}`;
  return new CustomError(msg, 400);
};

/**
 * Handle Prisma errors and convert them into a CustomError.
 *
 * @param {Object} err - Prisma error.
 * @returns {CustomError} - CustomError object with a specific error message.
 */
const prismaErrorHandler = (err: any): CustomError => {
  let msg: string;
  switch (err.code) {
    case 'P2002':
      msg = `Unique constraint failed on the field: ${err.meta.target}`;
      break;
    case 'P2025':
      msg = `Record not found: ${err.meta.cause}`;
      break;
    case 'P2003':
      msg = `Foreign key constraint failed on the field: ${err.meta.field_name}`;
      break;
    case 'P2004':
      msg = `A constraint failed on the database: ${err.meta.database_error}`;
      break;
    case 'P2005':
      msg = `The value provided for the field is invalid: ${err.meta.field_name}`;
      break;
    case 'P2006':
      msg = `The provided value for the field is too long: ${err.meta.field_name}`;
      break;
    case 'P2007':
      msg = `Data validation error: ${err.meta.database_error}`;
      break;
    case 'P2008':
      msg = `Failed to parse the query: ${err.meta.query}`;
      break;
    case 'P2009':
      msg = `Failed to validate the query: ${err.meta.query}`;
      break;
    case 'P2010':
      msg = `Raw query failed: ${err.meta.database_error}`;
      break;
    case 'P2011':
      msg = `Null constraint violation on the field: ${err.meta.field_name}`;
      break;
    case 'P2012':
      msg = `Missing a required value: ${err.meta.field_name}`;
      break;
    case 'P2013':
      msg = `Missing the required argument: ${err.meta.argument_name}`;
      break;
    case 'P2014':
      msg = `The change you are trying to make would violate the required relation: ${err.meta.relation_name}`;
      break;
    case 'P2015':
      msg = `A related record could not be found: ${err.meta.relation_name}`;
      break;
    case 'P2016':
      msg = `Query interpretation error: ${err.meta.database_error}`;
      break;
    case 'P2017':
      msg = `The records for the relation are not connected: ${err.meta.relation_name}`;
      break;
    case 'P2018':
      msg = `The required connected records were not found: ${err.meta.relation_name}`;
      break;
    case 'P2019':
      msg = `Input error: ${err.meta.database_error}`;
      break;
    case 'P2020':
      msg = `Value out of range for the type: ${err.meta.field_name}`;
      break;
    case 'P2021':
      msg = `The table does not exist in the current database: ${err.meta.table}`;
      break;
    case 'P2022':
      msg = `The column does not exist in the current database: ${err.meta.column}`;
      break;
    case 'P2023':
      msg = `Inconsistent column data: ${err.meta.database_error}`;
      break;
    case 'P2024':
      msg = `Timed out fetching a new connection from the connection pool: ${err.meta.database_error}`;
      break;
    default:
      msg = 'An unknown error occurred with the database.';
  }
  return new CustomError(msg, 400);
};

/**
 * Express error handler middleware.
 *
 * @param {Object} error - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const globalErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Set default status code and status if not provided
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Handle errors in development environment
    devErrors(res, error);
  } else if (process.env.NODE_ENV === 'production') {
    // Handle errors in production environment

    // If any duplicate key is found, handle it here
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);

    // If it's a validation error, handle it here
    if (error.message === 'Validation failed')
      error = validationErrorHandler(error);

    // If it's a Prisma error, handle it here
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = prismaErrorHandler(error);

    // Handle other types of errors here
    if (error.name === 'UnauthorizedError') {
      error = new CustomError('Unauthorized access', 401);
    } else if (error.name === 'ForbiddenError') {
      error = new CustomError('Forbidden access', 403);
    }

    productionError(res, error);
  }
};

export default globalErrorHandler;
