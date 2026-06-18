import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    error = new ApiError(statusCode, message);
  }

  if (error.statusCode === 500) {
    logger.error('Internal Server Error', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
      stack: error.stack,
    });
  }

  if (error.statusCode === 500) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
  });
};

export default errorHandler;