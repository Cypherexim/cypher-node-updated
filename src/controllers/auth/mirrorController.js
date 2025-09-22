import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { extractCountry } from "../../utils/miscellaneous.js";
import { deductSearches, getDatabaseQuery } from "../../utils/common.js";

export const mirrorController = {
    export: async(req, res, next) => {
        try {
            const { UserId, IsWorkspaceSearch = false } = req?.body;
            const result = {counters:{}, data:{}};
            
            req.body["CountryofOrigin"] = [extractCountry(req?.route?.path)];
            
            const check = await deductSearches(UserId, IsWorkspaceSearch);
            
            if (check) {                
                const query = await getDatabaseQuery({
                    body: req.body,
                    tablename: "export_mirror",
                    isOrderBy: true, 
                    query: ""
                });

                db.query(query[0], query[1]?.slice(1), (err, results) => {
                    if(err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    else {
                        result.data = results?.rows;    
                        return success(res, "SUCCESS", result, res?.statusCode);
                    }
                });
            } else { return next(ErrorHandling?.creditRequiredError()); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    import: async(req, res, next) => {
        try {
            const { UserId, IsWorkspaceSearch = false } = req?.body;
            const result = {counters:{}, data:{}};

            req.body["CountryofDestination"] = [extractCountry(req?.route?.path)];
            
            const check = await deductSearches(UserId, IsWorkspaceSearch);
            
            if (check) {
                const query = await getDatabaseQuery({
                    body: req?.body,
                    tablename: "import_mirror",
                    isOrderBy: true, 
                    query: ""
                });

                db.query(query[0], query[1]?.slice(1), (err, results) => {
                    if(err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    else {
                        result.data = results?.rows;    
                        return success(res, "SUCCESS", result, res?.statusCode);
                    }
                });
            } else { return next(ErrorHandling?.creditRequiredError()); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
}
