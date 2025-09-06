export class ErrorHandling {
    constructor(statusCode, errorMsg) {
        this.statusCode = statusCode;
        this.errorMsg = errorMsg;
    }

    internalServerError(msg="Internal Server Error") {
        return new ErrorHandling(500, msg);
    }

    notFoundError(msg="404 Not Found Error") {
        return new ErrorHandling(404, msg);
    }

    //invalid syntax/parameter/required data
    badRequestError(msg = "Invalid Syntax/Argument Error") {
        return new ErrorHandling(400, msg);
    }

    //did not receive a timely response from an upstream server
    gatewayTimeoutError(msg = "Geteway Timeout Error") {
        return new ErrorHandling(504, msg);
    }

    unauthorizedError(msg = "Unauthorization Error") {
        return new ErrorHandling(401, msg);
    }

    //request is well-formed but contains semantic errors, often related to validation failures
    unprocessedEntityError(msg = "Semantic/Validation Error") {
        return new ErrorHandling(422, msg);
    }

    //client is authentic but not having permissions
    forbiddenError(msg = "Invalid Permission Error") {
        return new ErrorHandling(403, msg);
    }

    methodNotAllowedError(msg = "Method Not Allowed Error") {
        return new ErrorHandling(405, msg);
    }
}
