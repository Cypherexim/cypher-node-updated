import { validationResult } from 'express-validator';
import { userValitionError } from "../utils/miscellaneous.js";
import { ErrorHandling } from '../error/error.js';

export const userValidation = async(req, res, next) => {
    try {
        const bodyKeys = Object.keys(req?.body);
        const errorList = [];

        for(let i=0; i<bodyKeys.length; i++) errorList.push(userValitionError[bodyKeys[i]]);

        await Promise.all(errorList.map(validation => validation.run(req)));

        const collectedErrors = validationResult(req);
        if(!collectedErrors.isEmpty()) {
            const errorStr = collectedErrors?.array().map(err => err?.msg).join(", ");
            return next(ErrorHandling.unprocessedEntityError(errorStr));
        }

        return next();
    } catch (error) { return next(ErrorHandling.internalServerError("Internal Server Error", error?.message)); }
}
