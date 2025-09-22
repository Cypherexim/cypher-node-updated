import { body, validationResult } from "express-validator";

export const countryBodyValidator = [
    body("fromDate").custom((value, {req}) => {
        if(value === "") { throw new Error("FromDate field is required!"); }
        else {
            const date = new Date(value);
            if (isNaN(date.getTime())) { throw new Error('Invalid FromDate format'); }
        }
        return true;
    }),
    body("toDate").custom((value, {req}) => {
        if(value === "") { throw new Error("ToDate field is required!"); }
        else {
            const date = new Date(value);
            if (isNaN(date.getTime())) { throw new Error('Invalid ToDate format'); }
        }
        return true;
    }),
    body("UserId").custom((value, {req}) => {
        if(value === "" || isNaN(value)) { throw new Error('User ID is required!'); }
        return true;
    }),
    body("page").custom((value, {req}) => {
        if([null, undefined].includes(value)) { throw new Error('Page number is required'); }
        else if(isNaN(value)) { throw new Error('Invalid page number!'); }
        return true;
    }),
    body("itemperpage").custom((value, {req}) => {
        if([null, undefined].includes(value)) { throw new Error('Page number is required'); }
        else if(isNaN(value)) { throw new Error('Invalid page number!'); }
        return true;
    }),
    body("IsWorkspaceSearch").isBoolean().withMessage("Invalid Boolean flag type"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
