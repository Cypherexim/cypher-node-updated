import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";

export const whatsTrandingControllers = {
    getWhatstrandingAnalysis: (req, res, next) => {
        const {year, direction, tableType} = req?.query;
        const columns = tableType=="month" ? ["month","current_value","growth"] : tableType=="company" ? ["hscode","company","value"] : ["country","value"];
        const sql = `select ${columns.toLocaleString()} from whatstranding_${tableType}wise where year=${year} and direction='${direction}' and active=true order by id`;

        try {
            db?.query(sql, (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    }, 

    getWhatstrandingTotalValues: (req, res, next) => {
        const sql = `select total_import, total_export, total_value from whatstranding_totalvalues where year=$1 and active=true`;

        try {
            db?.query(sql, [req?.query?.year], (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    },

    getWhatsTrendingCommodity: (req, res, next) => {
        const {year, direction} = req.query;
        const sqlQuery = `select commodity_name, "Year", "Month", total_value from whatstranding_commoditiwise where "direction"=$1 and "Year">=$2 and "Year"<=$3 and active=true`;
        
        try {
            db?.query(sqlQuery, [direction, year, Number(year)+2], (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    }, 

    getWhatsTrending: (req, res, next) => {
        try {
            const { country, direction, year } = req?.query;
            const fromDate = year + '-01-01';
            const toDate = year + '-02-02';
            const sqlQuery = `SELECT ROUND(SUM("ValueInUSD")::numeric,2) as LastYearTrend FROM ${direction?.toLowerCase()}_${country?.toLowerCase()} where "Date" >= $1  AND "Date" <= $2`;
    
            db?.query(sqlQuery, [fromDate, toDate], (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    }, 

    getWhatsTrandingMap: (req, res, next) => {
        try {
            const sqlQuery = `select country, total_exporters, total_importers, exp_share, imp_share from whatstranding_worldmap order by total_exporters desc`;
            
            db?.query(sqlQuery, (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    }, 

    topcountriesByValue: (req, res, next) => {
        try {
            const { country, direction, fromDate, toDate } = req?.query;
            const sqlQuery = direction.toLowerCase() === 'export'
            ? `Select ROUND(SUM("ValueInUSD")::numeric,2) as total,"CountryofDestination" from ${direction?.toLowerCase()}_${country?.toLowerCase()} WHERE "Date" BETWEEN $1 AND $2 group by "CountryofDestination" ORDER BY total DESC LIMIT 10`
            : `Select ROUND(SUM("ValueInUSD")::numeric,2) as total,"CountryofOrigin" from ${direction?.toLowerCase()}_${country?.toLowerCase()} WHERE "Date" BETWEEN $1 AND $2 group by "CountryofOrigin" ORDER BY total DESC LIMIT 10`;
            
            db?.query(sqlQuery, [fromDate, toDate], (err, results) => {
                if(err) {return next(ErrorHandling?.forbiddenError(err?.message, err));}
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) {return next(ErrorHandling?.internalServerError(err?.message, err));}
    }
}
