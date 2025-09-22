import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { getCurrentTableName } from "../../utils/utility.js";
import { sideFiltersQuery, fetchSideFilterQuery } from "../../utils/miscellaneous.js";
import { getDatabaseQuery, getPreRequiredDataForFurtherFetching } from "../../utils/common.js";



export const sideFilterController = {
    hsCode: async (req, res, next) => {
        try {
            const { CountryCode, CountryName, Direction, countryType } = req?.body;
            const {tableName, statCountryName} = getCurrentTableName({countryType, direction: Direction, countryname:CountryName});
            await getPreRequiredDataForFurtherFetching({countryType, Direction, countryname: CountryName, statCountryName, body: req?.body || {}});            

            const fieldList = ["ValueInUSD"], output = {};
            const isIndiaCountry = ["IND", "WEE"].includes(CountryCode);
            let selectQuery = "Distinct ", valuefield = "", group = '"HsCode"';
            
            const availablefield = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, fieldList]);
            if (availablefield?.rows?.length > 0 && isIndiaCountry) {
                valuefield = 'ROUND(SUM(CAST("ValueInUSD" as DOUBLE PRECISION))::numeric,2) as ValueInUSD ';
            }
            const access = await db?.query(sideFiltersQuery?.GET_HSCODE_ACCESS, [CountryCode, Direction?.toUpperCase(), countryType]);            
    
            if (access?.rows?.length > 0) {
                const keys = Object?.keys(access?.rows[0]);
                const obj = access?.rows[0];
                
                if (!Object?.values(access?.rows[0])?.includes(true)) {
                    for (let i = 0; i < keys?.length; i++) {
                        if (!obj[keys[i]]) { output[keys[i]] = []; }
                    }
                    return success(res, "SUCCESS", output, res?.statusCode);
                } else {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]]) { selectQuery += `"${keys[i]}"${keys?.length>0 ? ", ": ""}`; }
                    }
                    const partialQuery = `${selectQuery?.replace(/,\s*$/, "")}${valuefield!="" ? ", "+valuefield: ""}`;
                    const query = await getDatabaseQuery({
                        body: req?.body, 
                        tablename: tableName,
                        isOrderBy: false,
                        query: `${partialQuery} FROM `
                    });

                    const finalQuery = `${query[0]} Group By ${selectQuery?.replace('Distinct ', "")?.replace(/,\s*$/, "")}, ${group}`;
                    
                    db?.query(finalQuery, query[1]?.slice(1), (err, results) => {
                        if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                }
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    country: async (req, res, next) => {
        try {
            const { CountryCode, CountryName, Direction, countryType, isSideFilter, limit } = req?.body;
            const {tableName, statCountryName} = getCurrentTableName({countryType, direction: Direction, countryname:CountryName});
            await getPreRequiredDataForFurtherFetching({countryType, Direction, countryname:CountryName, statCountryName, body: req?.body || {}});            

            const fieldList = ["ValueInUSD"], output = {};
            let valuefield = '', selectQuery = 'Distinct ', count = '', group = '';
            const availablefield = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, fieldList]);
            const access = await db?.query(sideFiltersQuery?.GET_COUNTRY_ACCESS, [CountryCode, Direction?.toUpperCase(), countryType]);
            const isIndiaCountry = ["IND", "WEE"]?.includes(CountryCode);
    
            if (availablefield?.rows?.length > 0 && isIndiaCountry) {
                valuefield = ' ROUND(SUM(CAST("ValueInUSD" as DOUBLE PRECISION))::numeric,2) as ValueInUSD';
            }
            
            group = Direction?.toLowerCase() === 'import' ? '"CountryofOrigin"': '"CountryofDestination"';
            
            if (access?.rows?.length > 0) {
                const keys = Object?.keys(access?.rows[0]);
                const obj = access?.rows[0];
                
                if (!Object?.values(access?.rows[0])?.includes(true)) {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]] == false) {
                            output[keys[i]] = [];
                        }
                    }
                    return  success(res, "SUCCESS", output, res?.statusCode);
                } else {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]]) { selectQuery += `"${keys[i]}", `; }
                    }
                    
                    let finalQuery = `${selectQuery?.replace(/,\s*$/, "")}${valuefield!='' || count!='' ? `,${valuefield + count}`: ''}`;
                    const partialQuery = await getDatabaseQuery({
                        body: req?.body,
                        tablename: tableName,
                        isOrderBy: false,
                        query: `${finalQuery} FROM `
                    });

                    const query = `${partialQuery[0]} group by ${selectQuery?.replace('Distinct ', "")?.replace(/,\s*$/, "")}${isSideFilter ? ` limit ${limit}`: ""}`;
                    
                    db?.query(query, partialQuery[1]?.slice(1), (err, results) => {
                        if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                }
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    company: async(req, res, next) => {
        try {
            const { CountryCode, CountryName, Direction, countryType, isSideFilter, limit } = req?.body;
            const {tableName, statCountryName} = getCurrentTableName({countryType, direction: Direction, countryname:CountryName});
            await getPreRequiredDataForFurtherFetching({countryType, Direction, countryname:CountryName, statCountryName, body: req?.body || {}});

            const fieldList = ["ValueInUSD"], output = {};
            let valuefield = '', selectQuery = 'Distinct ', group = '';
            const isIndiaCountry = ["IND", "WEE"]?.includes(CountryCode);
            const availablefield = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, fieldList]);
    
            if (availablefield?.rows?.length > 0 && isIndiaCountry) {
                valuefield = ' ROUND(SUM(CAST("ValueInUSD" as DOUBLE PRECISION))::numeric,2) as ValueInUSD';
            }

            const companyColName = req?.path?.includes("Exp_Name") ? "Exp_Name": "Imp_Name";
            const currentQuery = companyColName==="Exp_Name" ? sideFiltersQuery?.GET_EXPORT_ACCESS: sideFiltersQuery?.GET_IMPORT_ACCESS;
            const access = await db?.query(currentQuery, [CountryCode, Direction?.toUpperCase(), countryType]);            
            group = `"${companyColName}"`;
    
            if (access?.rows?.length > 0) {
                const keys = Object?.keys(access?.rows[0]);
                const obj = access?.rows[0];

                if (!Object?.values(access?.rows[0])?.includes(true)) {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]] === false) { output[keys[i]] = []; }
                    }
                    return success(res, "SUCCESS", output, res?.statusCode);
                } else {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]] === true) { selectQuery += `"${keys[i]}", `; }
                    }
                    const finalQuery = `${selectQuery?.replace(/,\s*$/, "")}${valuefield!='' ? `,${valuefield}`: ''}`;
                    const partialQuery = await getDatabaseQuery({
                        body: req?.body,
                        tablename: tableName,
                        isOrderBy: false,
                        query: `${finalQuery} FROM `
                    });

                    const querySql = `${partialQuery[0]} GROUP BY ${selectQuery?.replace("Distinct ", "")?.replace(/,\s*$/, "")}, ${group}${isSideFilter ? ` limit ${limit}`: ""}`;
                    
                    db?.query(querySql, partialQuery[1]?.slice(1), (err, results) => {
                        if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                }
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    common: async(req, res, next) => {
        try {
            const { CountryCode, CountryName, Direction, isSideFilter, limit, countryType } = req?.body;
            
            const tableName = `${Direction?.toLowerCase()}_${CountryName?.toLowerCase()}`;
            const fieldList = ["ValueInUSD"],  output = {};
            let valuefield = '', selectQuery = 'Distinct ';//, group = '';
            const isIndiaCountry = ["IND", "WEE"]?.includes(CountryCode);
            const availablefield = await db?.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)', [tableName, fieldList]);
            
            if (availablefield?.rows?.length > 0 && isIndiaCountry) {
                valuefield = ' ROUND(SUM(CAST("ValueInUSD" as DOUBLE PRECISION))::numeric,2) as ValueInUSD';
            }
            const access = await db?.query(fetchSideFilterQuery(req?.path), [CountryCode, Direction?.toUpperCase(), countryType]);        
            // group = req?.path?.replace(/^\/get|Filter$/gi, "");
    
            if (access?.rows?.length > 0) {
                const keys = Object?.keys(access.rows[0]);
                const obj = access?.rows[0];
                if (!Object?.values(access?.rows[0])?.includes(true)) {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]] === false) { output[keys[i]] = []; }
                    }
                    return success(res, "SUCCESS", output, res?.statusCode);
                } else {
                    for (let i = 0; i < keys?.length; i++) {
                        if (obj[keys[i]] === true) { selectQuery += `"${keys[i]}", `; }
                    }
                    const finalQuery = `${selectQuery?.replace(/,\s*$/, "")}${valuefield!='' ? `,${valuefield}`: ''}`;
                    const partialQuery = await getDatabaseQuery({
                        body: req?.body,
                        tablename: tableName,
                        isOrderBy: false,
                        query: `${finalQuery} FROM `
                    });
                    const querySql = `${partialQuery[0]} GROUP BY ${selectQuery?.replace("Distinct ", "")?.replace(/,\s*$/, "")}${isSideFilter ? ` limit ${limit}`: ""}`;
                    
                    db.query(querySql, partialQuery[1]?.slice(1), (err, results) => {
                        if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                }
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
}


