// Response Handlers

/**
 * Response Code 500s - Server error
 * @param {*} err 
 * @param {*} res 
 * @param {string} errorMessage 
 */
export const error500sServerError = (err, res, errorMessage) => {
  console.error(err);
  return res.status(500).json({
    error: errorMessage,
    response: err,
  });
}

/**
 * Response Code 400s - Client Error
 * @param {*} res 
 * @param {*} req 
 * @param {string} errorMessage 
 */
export const res400sClientError = (res, req, errorMessage, data = null) => {
  const code = (req.method === 'POST' || req.method === 'PUT') ? 422 : 404;
  return res.status(code).json({
    error: errorMessage,
    data: data,
  });
}

/**
 * Response Code 403 - Forbidden
 * @param {*} res 
 * @param {string} errorMessage 
 * @param {*} data 
 * @returns 
 */
export const res403ClientError = (res, errorMessage, data = null) => {
  const code = 403;
  return res.status(code).json({
    error: errorMessage,
    data: data,
  });
}

/**
 * Response Code 200s - OK
 * @param {*} res 
 * @param {*} req 
 * @param {*} data 
 */
export const res200sOK = (res, req, data) => {
  const code = (req.method === 'POST') ? 201 : 200;
  return res.status(code).json(data);
}