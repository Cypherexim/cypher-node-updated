import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { deductSearches, getDatabaseQuery } from "../../utils/common.js";

export const weeklyController = {
    export: async(req, res, next) => {
        const { UserId, IsWorkspaceSearch=false } = req?.body;

        try {
            const counterquery = await getDatabaseQuery({
                body: req?.body,
                tablename: "export_weekly",
                isOrderBy: true,
                query: "",
                searchType: "data"
            });
            const check = await deductSearches(UserId, IsWorkspaceSearch);
            
            if(check) {
                db.query(counterquery[0], counterquery[1]?.slice(1), (err, results) => {
                    if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                    else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                });
            } else { return next(ErrorHandling?.creditRequiredError()); }
            
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    },

    import: async(req, res, next) => {
        const { UserId, IsWorkspaceSearch=false } = req?.body;
        
        try {
            const counterquery = await getDatabaseQuery({
                body: req?.body,
                tablename: "import_weekly",
                isOrderBy: true,
                query: "",
                searchType: "data"
            });
            const check = await deductSearches(UserId, IsWorkspaceSearch);

            if(check) {
                db.query(counterquery[0], counterquery[1].slice(1), (err, results) => {
                    if(err) { return next(ErrorHandling?.forbiddenError(err?.message, err)); }
                    else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                });
            } else { return next(ErrorHandling?.creditRequiredError()); }            
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    }
}
