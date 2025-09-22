import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { deductSearches, getDatabaseQuery } from "../../utils/common.js";

export const chinaController = {
    export: async(req, res, next) => {
        try {
            const { UserId, IsWorkspaceSearch = false } = req?.body;
            const result = {counters:{}, data:{}};
            const check = await deductSearches(UserId, IsWorkspaceSearch);

            if (check) {
                const query = await getDatabaseQuery({
                    body: req?.body,
                    tablename: "export_china",
                    isOrderBy: true, 
                    query: ""
                });
console.log(query);

                db?.query(query[0], query[1]?.slice(1), (err, results) => {
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
            const { UserId, IsWorkspaceSearch = false } = req.body;
            const result = {counters:{}, data:{}};
            const check = await deductSearches(UserId, IsWorkspaceSearch);

            if (check) {
                const query = await getDatabaseQuery({
                    body: req?.body,
                    tablename: "import_china",
                    isOrderBy: true, 
                    query: ""
                });

                db?.query(query[0], query[1]?.slice(1), (err, results) => {
                    if(err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    else {
                        result.data = results?.rows;
                        return success(res, "SUCCESS", result, res?.statusCode);
                    }
                });
            } else { return next(ErrorHandling?.creditRequiredError()); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
};
