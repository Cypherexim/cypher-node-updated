export class ErrorHandling {
    constructor(statusCode, errorMsg, errorStack) {
        this.statusCode = statusCode;
        this.errorMsg = errorMsg;
        this.errorStack = errorStack;
    }

    static internalServerError(msg="Internal Server Error", err = null) {
        return new ErrorHandling(500, msg, err?.stack);
    }

    static notFoundError(msg="404 Not Found Error", err = null) {
        return new ErrorHandling(404, msg, err?.stack);
    }

    //invalid syntax/parameter/required data
    static badRequestError(msg = "Invalid Syntax/Argument Error", err = null) {
        return new ErrorHandling(400, msg, err?.stack);
    }

    //did not receive a timely response from an upstream server
    static gatewayTimeoutError(msg = "Geteway Timeout Error", err = null) {
        return new ErrorHandling(504, msg, err?.stack);
    }

    static unauthorizedError(msg = "Unauthorization Error", err = null) {
        return new ErrorHandling(401, msg, err?.stack);
    }

    //request is well-formed but contains semantic errors, often related to validation failures
    static unprocessedEntityError(msg = "Semantic/Validation Error", err = null) {
        return new ErrorHandling(422, msg, err?.stack);
    }

    //client is authentic but not having permissions
    static forbiddenError(msg = "Invalid Permission Error", err = null) {
        return new ErrorHandling(403, msg, err?.stack);
    }

    //Insufficient Balance
    static creditRequiredError(msg = "You don't have enough search credit please contact admin to recharge!", err = null) {
        return new ErrorHandling(402, msg, err?.stack);
    }

    static methodNotAllowedError(msg = "Method Not Allowed Error", err = null) {
        return new ErrorHandling(405, msg, err?.stack);
    }

    //Already Data Exist
    static alreadyExistError(msg = "Data Already Exist Error", err = null) {
        return new ErrorHandling(409, msg, err?.stack);
    }

    //limit exceed error
    static outOfLimitError(msg = "Rate Limiting Error", err = null) {
        return new ErrorHandling(429, msg, err?.stack);
    }
}
