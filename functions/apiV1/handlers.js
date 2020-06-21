module.exports = {
    error500s: errorHandlerServerError,
    res400s: res400sClientError,
    res200s: res200sOK,
}

/*  
    ----------------------
    Response Handlers
    ----------------------
*/

function errorHandlerServerError(err, res, errorMessage) {
    return res.status(500).json({
        error: errorMessage,
        reason: err,
    });
}

function res400sClientError(res, req, errorMessage) {
    const code = (req.method === 'POST' || req.method === 'PUT') ? 422 : 404;
    return res.status(code).json({
        error: errorMessage,
    });
}

function res200sOK(res, req, data) {
    const code = (req.method === 'POST') ? 201 : 200;
    return res.status(code).json(data);
}