import db from '../../config/database.js';
import { ErrorHandling } from '../../error/error.js';
import { success } from '../../utils/response.js';
import { getCurrentTableName } from '../../utils/utility.js';
import { companyHandleGen } from '../../utils/company.js';

export const companyProfileController = {
    getCompanyProfileHandler: async(req, res, next) => {
        try {
            const companyHandleRes = await companyHandleGen(req?.body, req?.params?.type);

            if(!companyHandleRes) { return next(ErrorHandling?.badRequestError(err?.message, err)); }

            const { query, date } = companyHandleRes;
            const { dateFrom, dateTo } = date;

            db?.query(query, [dateFrom, dateTo], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getCompanyInfoDetails: (req, res, next) => {
        const sqlQuery = `select id, iec, company_name, person_name, contact, email, location, address from indian_companies where company_name ilike '%${req?.body?.company}%' and active=true`;

        try {
            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getCompanyListBykeword: function (req, res, next) {
        try {
            const sqlQuery = `select id, iec, company_name, person_name, contact, email, location, address from indian_companies where company_name ilike $1 and active=true limit 10`;

            db?.query(sqlQuery, [`${req?.query?.keyword}%`], (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)) }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    transferCompanyDetails: (req, res, next) => {        
        try {
            const { company, userId, dateTime } = req.body;
            const sqlQuery = `insert into requested_companies (company_name, request_datetime, requested_from) values($1, $2, $3)`;

            db?.query(sqlQuery, [company, dateTime, userId], (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)) }
                else { return success(res, ' Success.', result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getRequestedCompanies: (req, res, next) => {
        try {
            const sqlQuery = `select id, company_name, request_datetime, resolve_datetime, requested_from, resolved_by, status from requested_companies where active=true`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)) }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    setNewCompanyDetails: (req, res, next) => {
        try {
            const { iec, companyName, personName, contact, email, location, address } = req?.body;
            const sqlQuery = `insert into indian_companies (iec, company_name, person_name, contact, email, location, address) values($1, $2, $3, $4, $5, $6, $7)`;
            const sqlParams = [iec, companyName, personName, contact, email, location, address];
            
            db?.query(sqlQuery, sqlParams, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)) }
                else { return success(res,'Success', [], res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getFavoriteCompanies: (req, res, next) => {
        try {
            const sqlQuery = `select id, iec, company_name, person_name, contact, email, location, address from indian_companies where id in (${req?.body?.ids?.toString()}) and active=true`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getLinkedInCompanies: (req, res, next) => {
        try {
            const sqlQuery = `select id, company_name, company_type, "company_aboutUs", "company_website", "company_size",
            "company_associatedMembers", company_headquarter, company_linkedin, company_contact, company_address, 
            "company_googleDirection" from "LinkedIn_Companies" where company_name ilike $1 and active=true`;
            const queryParam = [req?.body?.companyName];

            db?.query(sqlQuery, queryParam, (err, result) => {                
                if(!err) {
                    const resultLen = result?.rows?.length;
                    if (resultLen > 1) {
                        const regex = new RegExp(`\\b${companyName}\\b`, "i");

                        for (let i = 0; i < resultLen; i++) {
                            const isOk = regex?.test(result?.rows[i]["company_name"]);
                            if (isOk) {
                                const resultRow = [result?.rows[i]];
                                return success(res, "SUCCESS", resultRow, res?.statusCode);
                            }
                        }

                        return success(res, "SUCCESS", result?.rows, res?.statusCode);
                    }

                    return success(res, "SUCCESS", result?.rows, res?.statusCode);
                } else { return next(ErrorHandling?.badRequestError(err?.message, err)) }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getLinkedInEmployees: (req, res, next) => {
        try {
            const { companyName } = req?.body;
            const sqlQuery = `select id, name, designation, url from "LinkedIn_Employees" where company_name ilike $1 and active=true`;
            const queryParam = [`%${companyName}%`];

            db?.query(sqlQuery, queryParam, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getCommodityCountList: (req, res, next) => {
        try {
            const sqlQuery = `select commodity, export_total, import_total from "allCommodityCompanyCounts" where active=true`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    addNewFeedback: (req, res, next) => {
        try {
            const { userId, feedback, time } = req?.body;
            const sqlQuery = `insert into "commodityCompanyFeedback" (user_id, msg, transaction_time) values($1, $2, $3)`;

            db?.query(sqlQuery, [userId, feedback, time], (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "INSERTED", [], res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getFeedbacks: (req, res, next) => {
        try {
            const sqlQuery = `insert into "commodityCompanyFeedback" (user_id, msg, transaction_time) values($1, $2, $3)`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getTopFiveCompanies: (req, res, next) => {
        try {
           const sqlQuery =`select id, INITCAP(company_name) as company_name, INITCAP(location) as location from "indian_companies" where id in (253364, 225224, 149647, 223686, 217597) and active=true`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getTopTenCompanies: (req, res, next) => {
        try {
            const sqlQuery =`select INITCAP(company_name) as company_name, INITCAP(person_name) as person_name, contact, email, INITCAP(location) as location from "indian_companies" where id not in (253364, 225224, 149647, 223686, 184606) and active=true limit 10`;

            db?.query(sqlQuery, (err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getLocatorCompaniesList: (req, res, next) => {
        try {
            const { country, direction, locatorType, word, countryType } = req?.body;

            const getLocatorQuery = (colName, tableName, whereCond) => `WITH early_matches AS ( SELECT "${colName}", "RecordID" as id FROM "${tableName}" WHERE ${whereCond} LIMIT 500 ) SELECT DISTINCT on ("${colName}") "${colName}", id FROM early_matches ORDER BY "${colName}" LIMIT 10`;
            const getQueryByWord = (word, colName, tableName) => `SELECT DISTINCT ON ("${colName}") "${colName}", "RecordID" as id FROM "${tableName}" WHERE "${colName}" ILIKE '${word}%' ORDER BY "${colName}" LIMIT 10`;

            const {tableName} = getCurrentTableName({countryType, direction, countryname: country?.toLowerCase()});
            
            const isInitial = req?.query?.initial=='true';
            const colName = locatorType==="Buyer" ? "Imp_Name": "Exp_Name";
            
            const locatorCond = `LOWER("${colName}") like '${isInitial ? "a": word?.toLowerCase()}%'`;
            const countryCond = !(["CUSTOM","CHINA"]?.includes(countryType)) ? `${direction=="import"? '"CountryofDestination"': '"CountryofOrigin"'}='${country?.toUpperCase()}' `: "";
            const whereCond = !(["CUSTOM","CHINA"]?.includes(countryType)) ? `${countryCond}ORDER BY "${colName}", CASE WHEN ${locatorCond} THEN 0 ELSE 1 END` : locatorCond;

            const sqlQuery = isInitial ? getLocatorQuery(colName, tableName, whereCond): getQueryByWord(word, colName, tableName);

            db?.query(sqlQuery, (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
}



