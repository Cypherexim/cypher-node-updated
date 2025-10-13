import db from "../../config/database.js";
import { success, getErrorStack } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { getDatabaseQuery, getavailableFieldlist } from "../../utils/common.js";
import { getCurrentTableName } from "../../utils/utility.js";
import { extractCountry } from "../../utils/miscellaneous.js";

export const analysisController = async(req, res, next) => {
    try {
        const { direction, fieldName='HsCode', countryType } = req?.body;
        let {countryname} = req?.body;

        const {tableName, statCountryName} = getCurrentTableName({countryType, direction, countryname});
        const Requestedfield = [fieldName];

        if(countryType==="MIRROR" && countryname!=="china") {
            const extractedCountryName = extractCountry(countryname);
            const countryKey = direction=="import" ? "CountryofDestination": "CountryofOrigin";            
            if(Object.hasOwn(req?.body, countryKey)) { req?.body[countryKey]?.push(extractedCountryName); } 
            else { req.body[countryKey] = [extractedCountryName]; }
        } else if(countryType==="STATISTICAL" && statCountryName!=="") {
            countryname = statCountryName;
        }
        
        const requestedfieldavailable = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, Requestedfield]);
        
        if (requestedfieldavailable?.rows?.length > 0) {
            const fieldList = ["Quantity", "ValueInUSD", "UnitPriceUSD", "UnitPriceFC", "Asset_Value_USD"];
            const availablefield = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, fieldList]);
            
            if (availablefield?.rows?.length > 0) {
                let fields = [];
                const colLen = availablefield?.rows?.length;

                for(let i=0; i<colLen; i++) {
                    const item = availablefield?.rows[i];
                    if (item?.column_name?.toString() != "UnitPriceUSD" && item?.column_name?.toString() != "UnitPriceFC") {
                        fields?.push(`ROUND(SUM("${item?.column_name?.toString()}")::numeric,2) as ${item?.column_name?.toString()}`);
                    } else {
                        fields?.push(`ROUND(AVG("${item?.column_name?.toString()}")::numeric,2) as ${item?.column_name?.toString()}`);
                    }
                }

                const finalqueryRes = await getDatabaseQuery({
                    body: req?.body,
                    tablename: tableName,
                    isOrderBy: false,
                    query: `"${fieldName}", ${fields?.toString()} FROM `,
                    searchType: `analysis-"${fieldName}"`
                });
                const finalQuery = `${finalqueryRes[0]} GROUP BY "${fieldName}"`;

                db?.query(finalQuery, finalqueryRes[1]?.slice(1), (err, result) => {
                    if (!err) {
                        fields = null;
                        return success(res, "SUCCESS", result?.rows, res?.statusCode);
                    } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else { return next(ErrorHandling?.unprocessedEntityError("Seems either of column Quantity/ValueInUSD/UnitPriceUSD not available in table.", getErrorStack("Required columns are not available"))); }
        } else { return next(ErrorHandling?.badRequestError(`Seems column ${fieldName} not available in table so can't produce analysis.`, getErrorStack(`${fieldName} not available in table`))); }
    } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
}

export const getRecordCountController = async(req, res, next) => {
    try {
        const {direction, countryType} = req?.body;
        let {countryname} = req?.body;
        const result = { counters: {} };
        const {tableName, statCountryName} = getCurrentTableName({countryType, direction, countryname}); // countryType=="CUSTOM" ? `${direction.toLowerCase()}_${countryname.toLowerCase()}`: countryname=="china" ? `${direction}_china`: `${direction}_mirror`;
        
        if(countryType==="MIRROR" && countryname!=="china") {
            const extractedCountryName = extractCountry(countryname);
            const countryKey = direction==="import" ? "CountryofDestination": "CountryofOrigin";
            if(Object.hasOwn(req?.body, countryKey)) { req?.body[countryKey]?.push(extractedCountryName); } 
            else { req.body[countryKey] = [extractedCountryName]; }
        } else if(countryType==="STATISTICAL" && statCountryName!=="") {
            countryname = statCountryName;
        }

        const counterquery = await getDatabaseQuery({
            body: req?.body,
            tablename: tableName,
            isOrderBy: false,
            query: await getavailableFieldlist(tableName, countryType),
            searchType: "count"
        });

        db?.query(counterquery[0], counterquery[1]?.slice(1), (err, results) => {
            if (!err) {
                result.counters = results?.rows[0];
                return success(res, "SUCCESS", result, res?.statusCode);
            } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
        });
    } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
}

