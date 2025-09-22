const RESPONSE_DATA = {
    message: "",
    error: false,
    code: 0,
    results: []
};

export const success = (res, message, results, statusCode) => {
    RESPONSE_DATA.message = message;
    RESPONSE_DATA.error = false;
    RESPONSE_DATA.code = statusCode;
    RESPONSE_DATA.results = results;

    return res?.status(200)?.json(RESPONSE_DATA);
}

export const error = (message, statusCode) => {
    const httpCode = !statusCode ? 500: statusCode; 

    RESPONSE_DATA.message = message;
    RESPONSE_DATA.code = httpCode;
    RESPONSE_DATA.error = true;
    RESPONSE_DATA.results = [];

    return RESPONSE_DATA;
}

export const getErrorStack = (msg) => {
    const error = new Error(msg);
    return error?.stack;
}
