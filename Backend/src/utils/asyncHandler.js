// asyncHandler is a higher-order function that takes an async function (fn) as input
const asyncHandler = (fn) => {
  return (req, res, next) => { 
      // Wraps the async function inside Promise.resolve()
    Promise.resolve(fn(req, res, next)) 
      // If fn() throws an error (rejects the promise), it is caught here
      .catch((error) => next(error)); // Passes the error to Express error-handling middleware
    };
  };
export {asyncHandler}
