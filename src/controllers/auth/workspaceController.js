import db from "../../config/database.js";
import { success, getErrorStack } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { deductDownload } from "../../utils/common.js";
// import { downloadingTemplate } from "../../utils/template/linkTemplate.js";

export const workspaceController = {
    getWorkspace: async (req, res, next) => {
        try {
            const { UserId } = req?.query;
            const sqlQuery = `SELECT * FROM public.workspace WHERE "UserId"=$1 or "UserId" IN(SELECT "UserId" from public."Cypher" where "ParentUserId"=$1) AND visible = true`;

            db?.query(sqlQuery, [UserId], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    addWorkspace: async (req, res, next) => {
        try {
            const { UserId, Searchbar, Sidefilter, foldername, customanalysis="" } = req?.body;
            const sqlQuery = `INSERT INTO public.workspace("UserId", "Searchbar", "Sidefilter","foldername","CustomAnalysis") VALUES ($1, $2, $3,$4, $5) RETURNING public."workspace"."Id"`;

            db.query(sqlQuery, [UserId, Searchbar, Sidefilter, foldername, customanalysis], (err, result) => {
                if (!err) { return success(res, "INSERTED", {Id: result?.rows[0]?.Id}, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    updateWorkspace: async (req, res, next) => {
        try {
            const { Id, customanalysis } = req?.body;
            const sqlQuery = `UPDATE public.workspace SET "CustomAnalysis"=$1 WHERE "Id"=$2`;

            db?.query(sqlQuery, [customanalysis, Id], (err, result) => {
                if (!err) { return success(res, "UDPATED", result?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };            
    },
    
    deleteWorkspace: async (req, res, next) => {
        try {
            const { id } = req?.query;
            const sqlQuery = `UPDATE public.workspace SET visible=false WHERE "Id"=$1`;

            db?.query(sqlQuery, [id], (err, result) => {
                if (!err) { return success(res, "DELETED", result?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }; 
    },

    saveDownload: async (req, res, next) => {
        try {
            const { countrycode, userId, direction, recordIds, workspacename } = req?.body;
            const datetime = new Date();
            const sqlQuery1 = `SELECT "workspacename" FROM public.userdownloadtransaction  where "workspacename"=$1`;
            const workspace = await db?.query(sqlQuery1, [workspacename]);

            if (workspace?.rows?.length === 0) {
                const sqlQuery2 = `select Count(elements) as totalrecordtobill from (select unnest(array[${recordIds?.toString()}]) except select unnest("recordIds") FROM public.userdownloadtransaction where "userId"=$1) t (elements)`;
                const recordtobill = await db?.query(sqlQuery2, [userId]);
                const sqlQuery3 = `INSERT INTO public.userdownloadtransaction("countrycode", "userId", direction, "data_query", workspacename, datetime, "filePath", 
                "status","errorlog","expirydate") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING public."userdownloadtransaction"."Id"`;
                const expirydate = new Date(Date.now() + ((60*60*24*7)*1000));
                const queryParams = [countrycode, userId, direction?.toUpperCase(), recordIds, workspacename, datetime, '', '', '', expirydate];

                db?.query(sqlQuery3, queryParams, async (err, result) => {
                    if (!err) {
                        await deductDownload(recordtobill?.rows[0]?.totalrecordtobill, countrycode, userId);
                        return success(res, "INSERTED", [], res.statusCode);
                    } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });

            } else { return next(ErrorHandling?.alreadyExistError("Workspace already exist with same name")); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }; 
    },

    getDownloadworkspace: async (req, res, next) => {
        try {
            const { userId } = req?.query;
            const sqlQuery = `SELECT "Id", countrycode as CountryName, "userId", direction,
            cardinality("recordIds") as totalrecords, workspacename, datetime,"filePath","status",
            "errorlog","expirydate" FROM public.userdownloadtransaction WHERE ("userId"=$1 or
            "userId" IN(SELECT "UserId" from public."Cypher" where "ParentUserId"=$1)) AND "active"=true`;

            db.query(sqlQuery, [userId], (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getDownloadCost: async (req, res, next) => {
        try {
            const { countryCode, countryType } = req?.query;
            const sqlQuery = `SELECT * FROM public."Dowload_cost" WHERE "CountryCode"=$1 AND "CountryType"=$2`;

            db.query(sqlQuery, [countryCode, countryType], (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
    
    getdownloaddata: async (req, res, next) => {
        try {
            const { direction, recordIds, country } = req?.body;
            const sqlQuery = `SELECT * FROM public.${direction?.toLowerCase()}_${country?.toLowerCase()} WHERE "RecordID" IN (${recordIds?.toString()})`;

            db?.query(sqlQuery, (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }; 
    },

    sharedownloadfile: async (req, res, next) => {
        try {
            let isAllDone = false;
            const datetime = new Date();
            const { WorkspaceId, UserIdto, UserIdBy } = req?.body;
            const sqlQuery1 = `INSERT INTO public.userdownloadtransaction(countrycode, "userId", direction, workspacename, datetime, "recordIds", "filePath", status, errorlog, expirydate)
            select "countrycode", $1, direction, workspacename, $2, "recordIds", "filePath", status, errorlog, expirydate from public.userdownloadtransaction where "Id"=$3`;
            const sqlQuery2 = `INSERT INTO public."ShareHistory"(shareby, shareto, date, "workspaceId") VALUES ($1, $2, $3, $4)`;

            if (WorkspaceId?.length > 0) {
                for(let i=0; i<WorkspaceId?.length; i++) {
                    UserIdto.forEach(async(userId) => {
                        const res = await db?.query(sqlQuery1, [userId, datetime, WorkspaceId[i]]);
                        if(!res) {
                            db?.query(sqlQuery2, [UserIdBy, userId, datetime, WorkspaceId[i]], (err, result) => {
                                if(err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                            });
                        } else { return next(ErrorHandling?.badRequestError(res?.message, res)); }
                    });

                    if(WorkspaceId?.length===i+1) { isAllDone = true; }
                }

                if(isAllDone) { return success(res, "INSERTED", [], 200); }
                else { return next(ErrorHandling?.internalServerError()); }
            } else { return next(ErrorHandling?.badRequestError("Please pass atleast single workspace ID", getErrorStack("Workspace ID array shouldn't be blank"))); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }; 
    },

    sendDownloadingLinkMail: async(req, res, next) => {
        try {
            const {downloadingLinkIDs, userEmails} = req?.body;
            const sqlQuery = `select "filePath", "workspacename" from "userdownloadtransaction" where "Id" in (${downloadingLinkIDs?.toString()}) and "status"='Completed'`;

            const response = await db?.query(sqlQuery);
            
            if(response && response?.rows?.length > 0) {
                // const htmlBody = downloadingTemplate(response?.rows);
                // const emailRes = await mail?.sendDownloadingLinkMail(userEmails[0], "Testing Downloading Links", htmlBody, userEmails?.length>0 ? userEmails: "");
                return success(res, "SUCCESS", [], res?.statusCode);                
            } else { return next(ErrorHandling?.badRequestError(response?.message, response)); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
};
