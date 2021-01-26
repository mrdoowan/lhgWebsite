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
    });
}

/**
 * Response Code 400s - Client Error
 * @param {*} res 
 * @param {*} req 
 * @param {string} errorMessage 
 */
export const res400sClientError = (res, req, errorMessage) => {
    const code = (req.method === 'POST' || req.method === 'PUT') ? 422 : 404;
    return res.status(code).json({
        error: errorMessage,
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