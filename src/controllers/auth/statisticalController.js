import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { countryMappingViaType } from "../../utils/miscellaneous.js";
import { getDatabaseQuery, deductSearches } from "../../utils/common.js";
import { getCountryDetails } from "../../utils/common.js";
import { ErrorHandling } from "../../error/error.js";

const tableColumns = {
    export: ["'RecordID'", "'HsCode'","'ProductDesc'","'Quantity'","'uqc'","'Currency'","'ValueInUSD'", "'CountryofDestination'"],
    import: ["'RecordID'", "'HsCode'","'ProductDesc'","'Quantity'","'uqc'","'Currency'","'ValueInUSD'", "'CountryofOrigin'"]
};

const countryDetailExtractor = (routerHandle) => {
    const { country } = getCountryDetails(routerHandle);
    return {...countryMappingViaType[country], name: country} || null;
}

export const statisticalController = {
    export: async(req, res, next) => {
        try {
            const result = {counters:{}, data:{}};
            const { UserId, IsWorkspaceSearch = false } = req?.body;
            const countryDetail = countryDetailExtractor(req?.path);
            const tableName = (countryDetail && countryDetail?.isCustom) ? `export_${countryDetail?.name}`: "export_mirror";

            const availableColQuery = `SELECT column_name FROM information_schema.columns WHERE table_name='${tableName}' AND column_name IN (${tableColumns["export"].toString()})`;
            
            let availableColumnsQuery = "";
            const apiResponse = await db?.query(availableColQuery);
            const responseColsLen = apiResponse?.rows?.length;
            responseColsLen>0 ? apiResponse?.rows?.forEach((col, i) => {
                availableColumnsQuery += `, "${col["column_name"]}"`;
                if((responseColsLen-1)==i) {
                    availableColumnsQuery = `${availableColumnsQuery?.substring(1)} from`
                }
            }) : "";

            if(countryDetail && !countryDetail?.isCustom) {
                req.body["CountryofOrigin"] = [countryDetail?.mirrorCountryName];
            }
            
            const check = await deductSearches(UserId, IsWorkspaceSearch);
            if (check) {
                const query = await getDatabaseQuery({
                    body: req.body,
                    tablename: tableName,
                    isOrderBy: true, 
                    query: availableColumnsQuery,
                    countryType: "STATISTICAL"
                });

                db.query(query[0], query[1].slice(1), (err, results) => {
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
            const result = {counters:{}, data:{}};
            const { UserId, IsWorkspaceSearch = false } = req.body;
            const countryDetail = countryDetailExtractor(req?.path);
            const tableName = (countryDetail && countryDetail?.isCustom) ? `import_${countryDetail?.name}`: "import_mirror";

            const availableColQuery = `SELECT column_name FROM information_schema.columns WHERE table_name='${tableName}' AND column_name IN (${tableColumns["import"]?.toString()})`;
                        
            let availableColumnsQuery = "";
            const apiResponse = await db?.query(availableColQuery);
            const responseColsLen = apiResponse?.rows?.length;
            responseColsLen>0 ? apiResponse?.rows?.forEach((col, i) => {
                availableColumnsQuery += `, "${col["column_name"]}"`;
                if((responseColsLen-1) == i) {
                    availableColumnsQuery = `${availableColumnsQuery?.substring(1)} from`
                }
            }) : "";

            if(countryDetail && !countryDetail?.isCustom) {
                req.body["CountryofDestination"] = [countryDetail?.mirrorCountryName];
            }
                    
            
            const check = await deductSearches(UserId, IsWorkspaceSearch);
            if (check) {
                const query = await getDatabaseQuery({
                    body: req?.body,
                    tablename: tableName,
                    isOrderBy: true, 
                    query: availableColumnsQuery,
                    countryType: "STATISTICAL"
                });

                db.query(query[0], query[1].slice(1), (err, results) => {
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

