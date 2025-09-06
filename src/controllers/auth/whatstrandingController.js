import db from "../../config/database.js";

export const whatsTrandingControllers = {
    getWhatstrandingAnalysis: (req, res, next) => {
        const {year, direction, tableType} = req.query;
        const columns = tableType=="month" ? ["month","current_value","growth"] : tableType=="company" ? ["hscode","company","value"] : ["country","value"];
        const sql = `select ${columns.toLocaleString()} from whatstranding_${tableType}wise where year=${year} and direction='${direction}' and active=true order by id`;

        try {
            db.query(sql, (err, result) => {
                if (!err) { return res.status(200).json(success("Ok", result.rows, res.statusCode)); } 
                else { return res.status(200).json(success("Ok", err.message, res.statusCode)); }
            });
        } catch (error) { return res.status(200).json(success("Ok", error.message, res.statusCode)); }
    }, 

    getWhatstrandingTotalValues: (req, res, next) => {
        const sql = `select total_import, total_export, total_value from whatstranding_totalvalues where year=$1 and active=true`;

        try {
            db.query(sql, [req.query.year], (err, result) => {
                if (!err) { return res.status(200).json(success("Ok", result.rows, res.statusCode)); } 
                else { return res.status(200).json(success("Ok", err.message, res.statusCode)); }
            });
        } catch (error) { return res.status(200).json(success("Ok", error.message, res.statusCode)); }
    },

    getWhatsTrendingCommodity: (req, res, next) => {
        const {year, direction} = req.query;
        const sqlQuery = `select commodity_name, "Year", "Month", total_value from whatstranding_commoditiwise where "direction"=$1 and "Year">=$2 and "Year"<=$3 and active=true`;
        
        try {
            db.query(sqlQuery, [direction, year, Number(year)+2], (err, result) => {
                if (!err) { return res.status(200).json(success("Ok", result.rows, res.statusCode)); } 
                else { return res.status(200).json(success("Ok", err.message, res.statusCode)); }
            });
        } catch (error) { return res.status(200).json(success("Ok", error.message, res.statusCode)); }
    }, 

    getWhatsTrending: (req, res, next) => {
        const { country, direction, year } = req.query;

        const fromDate = year + '-01-01';
        const toDate = year + '-02-02';
        const sqlQuery = `SELECT ROUND(SUM("ValueInUSD")::numeric,2) as LastYearTrend FROM ${direction.toLowerCase()}_${country.toLowerCase()} where "Date" >= $1  AND "Date" <= $2`;

        db.query(sqlQuery, [fromDate, toDate], (err, result) => {
            if (!err) {
                return res.status(200).json(success("Ok", result.rows, res.statusCode));
            } else {
                return res.status(200).json(success("Ok", err.message, res.statusCode));
            }
        });
    }, 

    getWhatsTrandingMap: (req, res, next) => {
        try {
            const sqlQuery = `select country, total_exporters, total_importers, exp_share, imp_share from whatstranding_worldmap order by total_exporters desc`;
            
            db.query(sqlQuery, (err, result) => {
                if(err) {res.status(500).json(error(err.message, res.statusCode));}
                else {res.status(200).json(success("OK", result.rows, res.statusCode));}
            });
        } catch (err) {
            res.status(500).json(error(err, res.statusCode));
        }
    }, 
}
