import db from '../../../config/database.js';
import { ErrorHandling } from '../../../error/error.js'
import { success } from '../../../utils/response.js';
import { formatDate } from '../../../utils/utility.js';

export const OthersAdminControllers = {
    adduserlog: async (req, res, next) => {
        try {
            const { UserId, IP, Location, Searchcount, Searchhistory } = req?.body;
            const datetime = formatDate(new Date());
            const sqlQuery1 = `SELECT * FROM "Userlog" where "UserId"=$1 AND "Datetime"=$2`;
            
            const log = await db?.query(sqlQuery1, [UserId, datetime]);

            if (log?.rows?.length > 0) {
                const sqlQuery2 = `update "Userlog" set "Searchcount" = "Searchcount" + $1 where "UserId"=$2 AND "Datetime"=$3`;

                db?.query(sqlQuery2, [Searchcount, UserId, datetime], (err, results) => {
                    if (!err) { return success(res, "UPDATED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else {
                const sqlQuery3 = `INSERT INTO public."Userlog"("UserId", "IP", "Location", "Searchcount", "Searchhistory", "Datetime") VALUES ($1, $2, $3, $4, $5, $6);`;

                db?.query(sqlQuery3, [UserId, IP, Location, Searchcount, Searchhistory, datetime], (err, results) => {
                    if (!err) { return success(res, "INSERTED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getUserlogs: async (req, res, next) => {
        try {
            const sqlQuery = `SELECT "Id", "Userlog"."UserId", "IP", "Userlog"."Location", "Searchcount", "Searchhistory", "Datetime", "Email" FROM public."Userlog" inner join "Cypher" on "Userlog"."UserId" = "Cypher"."UserId" ORDER BY "Datetime" DESC`;

            db?.query(sqlQuery, (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    adduseractionlog: async (req, res, next) => {
        try {
            const { UserId, LogType, Log } = req?.body;
            const date = formatDate(new Date());
            const sqlQuery = `INSERT INTO public."UserActionLog"("UserId", "LogType", "Log", "CreatedDate") VALUES ($1, $2, $3, $4)`;

            db?.query(sqlQuery, [UserId, LogType, Log, date], (err, results) => {
                if (!err) { return success(res, "INSERTED", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getUserActionlogs: async (req, res, next) => {
        try {
            const sqlQuery = `SELECT * FROM public."UserActionLog" where "LogType" ILIKE $1 ORDER BY "CreatedDate" DESC`;

            db?.query(sqlQuery, [`${req?.query?.LogType}%`], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    adduserActivitylog: async (req, res, next) => {
        try {
            const { UserId, IP, Email, date } = req?.body;
            const queries = `INSERT INTO public."UserActivityLog"("UserId", "Lastlogin", "IP","Email") VALUES ( $1, $2, $3, $4)`;

            db?.query(queries, [UserId, date, IP, Email], (err, results) => {
                if (!err) { return success(res, "INSERTED", [], res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getUserActivitylogs: async (req, res, next) => {
        try {
            const { UserId } = req?.query;
            if (UserId) {
                const sqlQuery = `SELECT * FROM "UserActivityLog" Where "UserId"=$1 ORDER BY "Lastlogin" DESC`;

                db?.query(sqlQuery, [UserId], (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else {
                const sqlQuery = `SELECT * FROM "UserActivityLog" ORDER BY "Lastlogin" DESC`;

                db?.query(sqlQuery, (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getAlertMessage: async (req, res, next) => {
        try {
            const sqlQuery = `SELECT * FROM public.alert_msg where "id"=$1 AND "status"= true`;

            db.query(sqlQuery, [req?.query?.Id], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)) }
    },

    updateAlertMessage: async (req, res, next) => {
        try {
            const { id, startDate, endDate, message, showPopup, showBanner } = req?.body;
            const queryParams = [message, startDate, endDate, showPopup, showBanner, id];
            const sqlQuery = `UPDATE public.alert_msg SET txt_msg=$1, start_date=$2, end_date=$3, show_popup=$4, show_marquee=$5, status=true WHERE id=$6`;
            // const { marquee } = JSON.parse(message);
            
            db?.query(sqlQuery, queryParams, async (err, results) => {
                if (!err) { return success(res, "UPDATED", [], res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)) }
    },

    addnotification: async (req, res, next) => {
        try {
            const { message } = req?.body;
            const date = new Date();
            const sqlQuery = `INSERT INTO public.push_notifications(message, created_date) VALUES ($1, $2)`;

            db?.query(sqlQuery, [message, date], (err, results) => {
                if (!err) { return success(res, "INSERTED", [], res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getnotification: async (req, res, next) => {
        const { Id } = req.query;

        try {
            const conditionalStr = ![null, undefined].includes(Id) ? `where "Id"=${req?.query?.Id}`: "";
            const sqlQuery = `SELECT "Id", "message", created_date, transaction_time FROM public.push_notifications ${conditionalStr} ORDER BY transaction_time DESC`;

            db?.query(sqlQuery, (err, results) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode) }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    }
}


