import { hash } from "bcryptjs";

import db from '../../../config/database.js';
import { success } from '../../../utils/response.js';
import { SendEmail } from "../../../services/mail.js";
import { ErrorHandling } from '../../../error/error.js';
import environment from "../../../config/environment.js";


export const userAdminController = {
    addUserByAdmin: async (req, res, next) => {
        try {
            const { FullName, CompanyName, MobileNumber, Email, Password, country, ParentUserId, Designation = null, Location = null, GST = null, IEC = null, RoleId, PlanId, 
            Downloads, Searches, StartDate, EndDate, Validity, DataAccess, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, 
            Favoriteshipment, Whatstrending, Companyprofile, Addonfacility, Analysis, User, AddUser, EditUser, DeleteUser, AddPlan, EditPlan, DeletePlan, DownloadsAccess, 
            Search, EnableId, DisableId, BlockUser, UnblockUser, ClientList, PlanList, Share } = req?.body;

            const sqlQuery1 = `SELECT "FullName", "CompanyName", "MobileNumber", "Email", "Password","RoleName", "Cypher"."UserId", "CountryCode", "ParentUserId", "Designation", 
            "Location", "GST", "IEC", "Cypher"."RoleId", "Enable","userPreference", public.userplantransaction."PlanId", public.userplantransaction."Downloads", 
            public.userplantransaction."Searches", public.userplantransaction."StartDate", public.userplantransaction."EndDate", public.userplantransaction."Validity", 
            public.userplantransaction."DataAccess", public.userplantransaction."CountryAccess", public.userplantransaction."CommodityAccess", public.userplantransaction."TarrifCodeAccess", 
            public.userplantransaction."Workspace", public.userplantransaction."WSSLimit", public.userplantransaction."Downloadfacility", public.userplantransaction."Favoriteshipment", 
            public.userplantransaction."Whatstrending", public.userplantransaction."Companyprofile", public.userplantransaction."Addonfacility", public.userplantransaction."Analysis", 
            public.userplantransaction."User",("EndDate"- now()::date) AS Remainingdays FROM public."Cypher" inner join public.userplantransaction on "Cypher"."UserId" = "userplantransaction"."UserId" 
            inner join public.plan on "userplantransaction"."PlanId" = "plan"."PlanId" inner join "Role" on "Cypher"."RoleId" = "Role"."RoleId" where "Email"=$1`;

            const userRes = await db?.query(sqlQuery1, [Email]);

            if (userRes?.rows?.length > 0) { return next(ErrorHandling?.dataAlreadyError("User Already Existi", userRes)); } 
            else { 
                const hashPassword = await hash(Password, 12);
                const sqlQuery2 = `INSERT INTO public."Cypher" ("FullName", "CompanyName", "MobileNumber", "Email", "Password", "CountryCode", "ParentUserId", "Designation", "Location", "GST", "IEC","RoleId")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING public."Cypher"."UserId";`

                db?.query(sqlQuery2, [FullName, CompanyName, MobileNumber, Email, hashPassword, country, ParentUserId, Designation, Location, GST, IEC, RoleId], async (err1, result1) => {
                    if (!err1) {
                        const sqlQuery3 = `INSERT INTO public.userplantransaction ("UserId", "PlanId", "Downloads", "Searches", "StartDate", "EndDate", "Validity", "DataAccess", "CountryAccess", "CommodityAccess", 
                        "TarrifCodeAccess", "Workspace", "WSSLimit", "Downloadfacility", "Favoriteshipment", "Whatstrending", "Companyprofile", "Addonfacility", "Analysis", "User") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`;

                        db?.query(sqlQuery3, [result1?.rows[0]?.UserId, PlanId, Downloads, Searches, StartDate, EndDate, Validity, DataAccess, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, Favoriteshipment, Whatstrending, Companyprofile, Addonfacility, Analysis, User], async (err2, result2) => {
                            if (!err2) {
                                const sqlQuery4 = `INSERT INTO public."UserAccess" ("AddUser", "EditUser", "DeleteUser", "AddPlan", "EditPlan", "DeletePlan", "Downloads", "Search", "EnableId", "DisableId", "BlockUser", "UnblockUser", "ClientList", "PlanList", "UserId","Share") VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;

                                await db?.query(sqlQuery4, [AddUser, EditUser, DeleteUser, AddPlan, EditPlan, DeletePlan, DownloadsAccess, Search, EnableId, DisableId, BlockUser, UnblockUser, ClientList, PlanList, result2?.rows[0]?.UserId, Share]);
                                await SendEmail(Email, environment?.mail?.userRegisterationmailSubject, environment?.mail?.accountcreationmailBody);

                                return success(res, "INSERTED", [], res?.statusCode);
                            } else { return next(ErrorHandling?.badRequestError(err2?.message, err2)); }
                        });
                    } else { return next(ErrorHandling?.badRequestError(err1?.message, err1)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }        
    },
    
    getUserDetailsByEmail: (req, res, next) => {
        try {
            const sqlQuery = `select "UserId", "MobileNumber" from "Cypher" where "Email"='${req?.query?.email}'`;

            db?.query(sqlQuery, (err, results) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    resetPassword: async (req, res, next) => {
        try {
            const sqlQuery1 = `SELECT * FROM public."Cypher" where "Email"=$1`;
            const user = await db?.query(sqlQuery1, [req?.body?.Email]);

            if (user?.rows.length > 0) {
                const hashPassword = await hash(environment?.defaultPass, 12);
                const sqlQuery2 = `UPDATE public."Cypher" SET "Password"=$1 WHERE "Email"=$2`;

                db?.query(sqlQuery2, [hashPassword, req?.body?.Email], (err, results) => {
                    if (!err) { return success(res, "UPDATED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else { return next(ErrorHandling?.dataAlreadyError(err?.message, err)); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    updateUserPreference: async (req, res) => {
        try {
            const { Email, userPreference } = req?.body;
            const sqlQuery = `UPDATE public."Cypher" SET "userPreference"=$2 WHERE "Email"=$1`;

            db?.query(sqlQuery, [Email, userPreference], (err, results) => {
                if (!err) { return success(res, "SUCCESS", [], res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling.internalServerError(err?.message, err)); };
    },

    // update response structure
    getLatestUserPref: (req, res) => {
        try {
            const sqlQuery = `SELECT "userPreference" FROM public."Cypher" where "Email"=$1`;

            db?.query(sqlQuery, [req?.query?.email], (err, results) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling.internalServerError(err?.message, err)); }
    },

    updateUserByAdmin: async (req, res) => {
        try {
            const { FullName, CompanyName, MobileNumber, Email, Password, country, UserId, Designation = null, Location = null, GST = null, IEC = null, RoleId, PlanId, 
            Downloads, Searches, StartDate, EndDate, Validity, DataAccess, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, 
            Favoriteshipment, Whatstrending, Companyprofile, Addonfacility, Analysis, User, AddUser, EditUser, DeleteUser, AddPlan, EditPlan, DeletePlan, 
            DownloadsAccess, Search, EnableId, DisableId, BlockUser, UnblockUser, ClientList, PlanList, Share } = req?.body;

            const sqlQuery1 = `SELECT "FullName", "CompanyName", "MobileNumber", "Email", "Password","RoleName", "Cypher"."UserId", "CountryCode", "ParentUserId", "Designation", 
            "Location", "GST", "IEC", "Cypher"."RoleId", "Enable","userPreference", public.userplantransaction."PlanId", public.userplantransaction."Downloads", 
            public.userplantransaction."Searches", public.userplantransaction."StartDate", public.userplantransaction."EndDate", public.userplantransaction."Validity",
            public.userplantransaction."DataAccess", public.userplantransaction."CountryAccess", public.userplantransaction."CommodityAccess", public.userplantransaction."TarrifCodeAccess",
            public.userplantransaction."Workspace", public.userplantransaction."WSSLimit", public.userplantransaction."Downloadfacility", public.userplantransaction."Favoriteshipment", 
            public.userplantransaction."Whatstrending", public.userplantransaction."Companyprofile", public.userplantransaction."Addonfacility", public.userplantransaction."Analysis", 
            public.userplantransaction."User",("EndDate"- now()::date) AS Remainingdays FROM public."Cypher" inner join public.userplantransaction on "Cypher"."UserId" = "userplantransaction"."UserId" 
            inner join public.plan on "userplantransaction"."PlanId" = "plan"."PlanId" inner join "Role" on "Cypher"."RoleId" = "Role"."RoleId" where "Email"=$1`;

            const userRes = await db?.query(sqlQuery1, [Email]);
            
            if (userRes?.rows?.length > 0) {
                const sqlQuery2 = `UPDATE public."UserAccess" SET "AddUser"=$2, "EditUser"=$3, "DeleteUser"=$4, "AddPlan"=$5,  "EditPlan"=$6, "DeletePlan"=$7, "Downloads"=$8, "Search"=$9, 
                "EnableId"=$10, "DisableId"=$11,  "BlockUser"=$12, "UnblockUser"=$13, "ClientList"=$14, "PlanList"=$15, "Share"=$16 WHERE "UserId"=$1`;

                db?.query(sqlQuery2, [FullName, CompanyName, MobileNumber, Email, country, Designation, Location, GST, IEC, RoleId, UserId], async (err1, results1) => {
                    if (!err1) {
                        const sqlQuery3 = `UPDATE public.userplantransaction SET "PlanId"=$1, "Downloads"=$2, "Searches"=$3, "StartDate"=$4, "EndDate"=$5, "Validity"=$6, 
                        "DataAccess"=$7, "CountryAccess"=$8, "CommodityAccess"=$9, "TarrifCodeAccess"=$10, "Workspace"=$11, "WSSLimit"=$12, "Downloadfacility"=$13, "Favoriteshipment"=$14, 
                        "Whatstrending"=$15, "Companyprofile"=$16, "Addonfacility"=$17, "Analysis"=$18, "User"=$19 WHERE "UserId"=$20`;

                        db?.query(sqlQuery3, [PlanId, Downloads, Searches, StartDate, EndDate, Validity, DataAccess, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, Favoriteshipment, Whatstrending, Companyprofile, Addonfacility, Analysis, User, UserId], async(err2, result2) => {
                            if (!err2) {
                                const sqlQuery4 = `UPDATE public."UserAccess" SET "AddUser"=$2, "EditUser"=$3, "DeleteUser"=$4, "AddPlan"=$5,  "EditPlan"=$6, "DeletePlan"=$7, "Downloads"=$8, 
                                "Search"=$9, "EnableId"=$10, "DisableId"=$11,  "BlockUser"=$12, "UnblockUser"=$13, "ClientList"=$14, "PlanList"=$15, "Share"=$16 WHERE "UserId"=$1`;

                                await db?.query(sqlQuery4, [UserId, AddUser, EditUser, DeleteUser, AddPlan, EditPlan, DeletePlan, DownloadsAccess, Search, EnableId, DisableId, BlockUser, UnblockUser, ClientList, PlanList, Share]);
                                await SendEmail(Email, environment?.mail?.userUpdatemailSubject, environment?.mail?.accountcreationmailBody);
                                    
                                return success(res, "UPDATED", [], res?.statusCode);
                            } else { return next(ErrorHandling?.badRequestError(err2?.message, err2)); }
                        });
                    } else { return next(ErrorHandling?.badRequestError(err1?.message, err1)); }
                });
            } else { return next(ErrorHandling?.badRequestError(userRes?.message, userRes)); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },

    getAllUserlist: async (req, res) => {
        try {
            const sqlQuery = `SELECT "FullName", "CompanyName", "MobileNumber", "Email", "Cypher"."UserId", "CountryCode", "ParentUserId", "Designation",
            "Location", "GST", "IEC", "Cypher"."RoleId","Cypher"."Enable","userplantransaction"."Downloads", "userplantransaction"."Searches", "userplantransaction"."StartDate", 
            "userplantransaction"."EndDate", "userplantransaction"."Validity", "userplantransaction"."DataAccess", "userplantransaction"."CountryAccess", "userplantransaction"."CommodityAccess", 
            "userplantransaction"."TarrifCodeAccess", "userplantransaction"."Workspace", "userplantransaction"."WSSLimit", "userplantransaction"."Downloadfacility", 
            "userplantransaction"."Favoriteshipment", "userplantransaction"."Whatstrending", "userplantransaction"."Companyprofile", "userplantransaction"."Addonfacility", "userplantransaction"."Analysis", 
            "userplantransaction"."User","plan"."PlanId", "plan"."PlanName", "AddUser", "EditUser", "DeleteUser", "AddPlan", "EditPlan", "DeletePlan", "UserAccess"."Downloads" as Dwnlds, 
            "Search", "EnableId", "DisableId", "BlockUser", "UnblockUser", "ClientList", "PlanList", "Share" FROM public."Cypher"  inner join "Role" on "Cypher"."RoleId" = "Role"."RoleId" 
            inner join public.userplantransaction on "Cypher"."UserId" = "userplantransaction"."UserId" OR "Cypher"."ParentUserId" = "userplantransaction"."UserId" inner join public."UserAccess" on 
            "Cypher"."UserId" = "UserAccess"."UserId" OR "Cypher"."ParentUserId" = "UserAccess"."UserId" inner join public.plan  on "plan"."PlanId" = "userplantransaction"."PlanId" ORDER BY "Cypher"."UserId" DESC`;

            db?.query(sqlQuery, (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    enabledisableuser: async (req, res) => {
        try {
            const { enable, UserId } = req?.body;
            const sqlQuery = `UPDATE public."Cypher" SET "Enable"=$1 WHERE "UserId"= $2`;

            db?.query(sqlQuery, [enable, UserId], (err, results) => {
                if (!err) { return success(res, "SUCCESS", [], res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getuserlistbyParentId: async (req, res) => {
        try {
            const sqlQuery = `SELECT * FROM public."Cypher" where "ParentUserId"=$1`;

            db?.query(sqlQuery, [req?.query?.ParentUserId], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    updateUserPassword: async (req, res) => {
        try {
            const { userId, email, password } = req?.body;
            const sqlQuery = `update "Cypher" set "Password"=$1 where "UserId"=$2 and "Email"=$3`;

            const cryptedPassword = await hash(password, 12);

            db?.query(sqlQuery, [cryptedPassword, userId, email], async(err, result) => {
                if (err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else {
                    const mailMsg = `Dear User, \n\nYour password has been reset successfully. Your new password will be "${password}". Please feel free to contact us for further queries. \n\nRegards,\nCypher Team`;
                    await SendEmail(email, "User password has been reset", mailMsg);
                    return success(res, "UPDATED", [], res?.statusCode);
                }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
}

