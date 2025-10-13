import { ErrorHandling  } from "../error/error.js";
import { verifyJWTtoken } from "../services/jwtToken.js";

export const jwtMiddleHandler = async(req, res, next) => {
    try {
       const token = req?.headers["x-access-token"];
    
        if (token) {
            const decodedRes = await verifyJWTtoken(token);

            if(!decodedRes) {
                return next(ErrorHandling.unauthorizedError("Unauthorized Access"));
            } else {
                req.decoded = decodedRes;
                next();
            }
        } else {
            return next(ErrorHandling.unauthorizedError("Token required to access this API."));
        } 
    } catch (error) {
        next(ErrorHandling.internalServerError("Token is expired", error));
    }
}

export const antiXSSPolicy = (req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  next();
}
