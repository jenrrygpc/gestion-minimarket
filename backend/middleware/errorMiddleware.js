const errorHandler = (err, req, res, next) => {
  console.log('errorHandler');
  console.log('res.statusCode ..:', res.statusCode);
  console.log('res ..:', res);
  console.log('res json ..:', res.toString());
  console.log('err ..:', err);
  const statusCode = (!res.statusCode || res.statusCode === 200) ?  500: res.statusCode;
  // const statusCode = res.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

module.exports = {
  errorHandler
}