import db from '../../../config/database.js';
import { success } from "../../../utils/response.js";
import {ErrorHandling} from '../../../error/error.js';

export const countryAdminController = {
    getCountries : async (req, res, next) => {
        try {
            const sqlQuery = `SELECT "Countrycode", "CountryName", "Import", "Export", "LatestDate", "StartDate", "Direction", "data_type" 
            FROM public."Country" inner join public.datauploadhistorybydate on public.datauploadhistorybydate."CountryCode" = public."Country"."Countrycode" ORDER BY "CountryName"`

            db?.query(sqlQuery, (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getCountrieswithoutdate : async (req, res, next) => {
        try {
            const sqlQuery = `SELECT "Countrycode", "CountryName" FROM public."Country" where data_type=$1 ORDER BY "CountryName"`;

            db?.query(sqlQuery, [req?.query?.type], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getAllCountrycodes : (req, res, next) => {
        try {
            const sqlQuery = `select country_name, replace(lower(country_name), ' ', '') AS country_value, country_code from country_codes where active=true order by country_name`;
            
            db?.query(sqlQuery, (err, results) => {
                if(!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    addCountry : async (req, res, next) => {
        const { countryName, countryType, imp, exp } = req?.body;
        const [country_name, country_code] = countryName.split("~");
        
        try {
            const sqlQuery1 =`select "Countrycode","data_type" from "Country" where data_type=$1 and "Countrycode"=$2`
            
            const country = await db?.query(sqlQuery1, [countryType, country_code]);

            if(country?.rows?.length > 0) {
            return next(ErrorHandling?.creditRequiredError(err?.message, err));
            } else {
                const sqlQuery2= 'INSERT INTO public."Country"("Countrycode", "CountryName", "Import", "Export", "data_type") VALUES ($1, $2, $3, $4, $5)'

                db?.query(sqlQuery2, [country_code, country_name, imp, exp, countryType], (error, results) => { //adding country here when country is not exist
                    if (!error) {
                        const sqlQuery3=`INSERT INTO public."Dowload_cost" ("CountryCode", "CostPerRecord", "CountryType") VALUES ($1, 1, $2)`

                        db?.query(sqlQuery3, [country_code, countryType], async(err, results) => { //adding downloading cost accordingly
                            if (!err) { 
                                const sqlQuery4=`INSERT INTO public."SideFilterAccess"("HsCode", "ProductDesc", "Exp_Name", "Imp_Name", "CountryofDestination", "CountryofOrigin", "PortofOrigin",
                                "Mode", "uqc", "Quantity", "Month", "Year", "Country", "Direction", "PortofDestination", "LoadingPort", "Currency", "NotifyPartyName", "CountryType", "active")
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`

                                await db?.query(sqlQuery4, [false, false, false, false, false, false, false, false, false, false, false, false, country_code, "IMPORT", false, false, false, false, countryType, imp]);// adding country's side filters when it is not available since country is inexisting

                                const sqlQuery5=`INSERT INTO public."SideFilterAccess"("HsCode", "ProductDesc", "Exp_Name", "Imp_Name", "CountryofDestination", "CountryofOrigin", "PortofOrigin",
                                "Mode", "uqc", "Quantity", "Month", "Year", "Country", "Direction", "PortofDestination", "LoadingPort", "Currency", "NotifyPartyName", "CountryType", "active") 
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`;

                                await db?.query(sqlQuery5, [false, false, false, false, false, false, false, false, false, false, false, false, country_code, "EXPORT", false, false, false, false, countryType, exp]);// adding country's side filters when it is not available since country is inexisting

                                const sqlQuery6=`insert into "datauploadhistorybydate" ("CountryCode", "Direction", "LatestDate", "StartDate", "CountryType") values($1, $2, NULL, NULL, $3)`

                                await db?.query(sqlQuery6, [country_code, "import", countryType]); //adding country import start and latest dates.

                                const sqlQuery7=`insert into "datauploadhistorybydate" ("CountryCode", "Direction", "LatestDate", "StartDate", "CountryType") values($1, $2, NULL, NULL, $3)`;

                                await db?.query(sqlQuery7, [country_code, "export", countryType]); //adding country export start and latest dates.
                                
                                return success(res, "INSERTED", [], res?.statusCode);
                            } else { return next(ErrorHandling?.badRequestError(err?.message, err));}
                        });
                    } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    updateCountry : async (req, res, next) => {
        try {
            const { countryCode, imp, exp } = req?.body;
            const sqlQuery=`UPDATE public."Country" SET  "Import"=$1, "Export"=$2 WHERE "Countrycode"=$3`;

            db?.query(sqlQuery, [imp, exp, countryCode], (error, results) => {
                if (!error) { return success(res, "UPDATE", [], res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)) };
    },

    addDataHistory : async (req, res, next) => {
        try {
            const { countryName, direction, latestDate, countryCode, countryType } = req?.body;
            const sqlQuery1 =`SELECT "LatestDate" FROM public.datauploadhistorybydate where "CountryType"=$1 AND "Direction"=$2 AND "CountryCode"=$3 AND "active"=true`;

            const values = await db?.query(sqlQuery1, [countryType, direction, countryCode]);

            if (values?.rows?.length > 0) {
                const sqlQuery2= `UPDATE public.datauploadhistorybydate SET "LatestDate"=$1 WHERE "CountryType"=$2 AND "CountryCode"=$3 AND "Direction"=$4`;
                
                db?.query(sqlQuery2, [latestDate, countryType, countryCode, direction], (error, results) => {
                    if (!error) { return success(res, "UPDATED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else {
                const sqlQuery=`INSERT INTO public.datauploadhistorybydate("CountryCode", "Direction", "LatestDate", "CountryType") VALUES ($1, $2, $3, $4)`;

                db?.query(sqlQuery, [countryName, direction, latestDate, countryCode], (error, results) => {
                    if (!error) { return success(res, "INSERTED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getlatestDate : async (req, res, next) => {
        try {
            const { direction, countryType, countryName, countryCode } = req?.query;
            
            let CountryType = "";
            if(["STATISTICAL","MIRROR"].includes(countryType)) {
                if(countryType==="STATISTICAL" && Object.hasOwn(countryMappingViaType, countryName)) {
                    CountryType = !countryMappingViaType[countryName]["isCustom"] ? "MIRROR" : "CUSTOM";
                } else {CountryType = "MIRROR";}
            } else {CountryType = "CUSTOM";}

            const sqlQuery =`SELECT "LatestDate" FROM public.datauploadhistorybydate where "CountryType"=$1 AND "Direction"=$2 AND "CountryCode"=$3 AND "active"=true`;

            db?.query(sqlQuery, [CountryType, direction, countryCode], (error, results) => {
                if (!error) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },


    getGlobalCountriesList : async (req, res, next) => {
        try {
            const sqlQuery =  `SELECT a."Countrycode", a."CountryName", a."Import", a."Export", a."data_type", a."active", a."is_new", 
            b."CountryCode", b."Direction", b."StartDate", b."LatestDate", b."CountryType" FROM "Country" a JOIN "datauploadhistorybydate" b 
            ON a."data_type" = b."CountryType" where b."CountryCode"=a."Countrycode" and "CountryType" like '%${req?.query?.type}%' order by a."Countrycode"`

            db?.query(sqlQuery, (err, results) => {
                if(err) {return next(ErrorHandling?.badRequestError(err?.message, err));}
                else {return success(res, "SUCCESS", results?.rows, res?.statusCode)}
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)) };
    },

    getAllGlobeCountries : async (req, res, next) => {
        try {
            const sqlQuery = `select "Countrycode", "CountryName", "Import", "Export", "data_type", "is_new", "active" FROM public."Country"`;

            db?.query(sqlQuery, (err, results) => {
                if(err) {return next(ErrorHandling?.badRequestError(err?.message, err));}
                else {return success(res, "SUCCESS", results?.rows, res?.statusCode)}
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)) };
    },

    getAllCountriesDates : async (req, res, next) => {
        try {
            const sqlQuery = `select "CountryCode", "Direction", "LatestDate", "StartDate" from datauploadhistorybydate`

            db?.query(sqlQuery, (err, results) => {
                if(err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
}

