import fs from "fs";
import { hash, compare } from "bcryptjs";

import db from "../../config/database.js";
import { success, getErrorStack } from '../../utils/response.js';
import { ErrorHandling } from '../../error/error.js';
import environment  from '../../config/environment.js';
import { signJWTtoken } from "../../services/jwtToken.js";

import { sendDownloadingLinkMail, SendEmail } from '../../services/mail.js';

export const authController = {
    createUser: async (req, res, next) => {
        try {
            const { FullName, CompanyName, MobileNumber, Email, Password, country, ParentUserId, RoleId } = req?.body;
            const getUserEmailQuery = `SELECT "Email" FROM public."Cypher" where "Email"=$1`;
            const user = await db?.query(getUserEmailQuery, [Email]);

            if(user?.rows?.length===0) {
                const hashPassword = await hash(Password, 12);
                const addUserQuery = `INSERT INTO public."Cypher"("FullName", "CompanyName", "MobileNumber", "Email", "Password", "CountryCode", 
                "ParentUserId", "Designation", "Location", "GST", "IEC","RoleId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                RETURNING public."Cypher"."UserId"`;
                const apiParams = [FullName, CompanyName, MobileNumber, Email, hashPassword, country, ParentUserId, '', '', '', '', RoleId];

                db?.query(addUserQuery, apiParams, async(err, results) => {
                    if (!err) {
                        if (ParentUserId === null || ParentUserId === '' || ParentUserId === undefined) {
                            const getPlanByNameQuery = `SELECT "UserId", "PlanId", "Downloads", "Searches" FROM public.plan WHERE "PlanName"=$1`;
                            const planDetails = await db?.query(getPlanByNameQuery, ["Start-Up"]);

                            if (planDetails?.rows?.length > 0) {
                                const addPlanTrasactionQuery = `INSERT INTO public.userplantransaction("UserId", "PlanId", "Downloads", "Searches", "StartDate") VALUES ($1, $2, $3, $4, $5)`;
                                const queryParams = [results?.rows[0]?.UserId, planDetails?.rows[0]?.PlanId, planDetails?.rows[0]?.Downloads, planDetails?.rows[0]?.Searches, date?.toISOString()];
                                
                                db?.query(addPlanTrasactionQuery, queryParams, (err, result) => {                                    
                                    if(!err) { return success(res, "INSERTED", [], res?.statusCode); }
                                    else { next(ErrorHandling?.badRequestError(err?.message, err)); }
                                });
                            }
                        } else {
                            await SendEmail(Email, environment?.mail?.userRegisterationmailSubject, environment?.mail?.accountcreationmailBody);
                            return success(res, "SUCCESS", [], res?.statusCode)
                        }
                    } else { return ErrorHandling?.notFoundError(err?.message, err); }
                });
            } else { return next(ErrorHandling?.dataAlreadyError(err?.message, err)); }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); }
    },


    postLogin: async (req, res, next) => {
        try {
            const { Email, Password } = req?.body;    
            
            const getUserEmailQuery = `SELECT "ParentUserId" FROM public."Cypher" where "Email"=$1`;
            const Parentuser = await db?.query(getUserEmailQuery, [Email]);
    
            const userIdColName = Parentuser?.rows[0]?.ParentUserId !== null ? "ParentUserId" : "UserId";
    
            const getUserQuery = `SELECT "FullName", "CompanyName", "MobileNumber", "Email", "Password","RoleName", 
            "Cypher"."UserId", "CountryCode", "ParentUserId", "Designation", "Location", "GST", "IEC", "Cypher"."RoleId", 
            "Enable","userPreference", public.userplantransaction."PlanId", public.userplantransaction."Downloads", 
            public.userplantransaction."Searches", public.userplantransaction."StartDate", public.userplantransaction."EndDate", 
            public.userplantransaction."Validity", public.userplantransaction."DataAccess", public.userplantransaction."CountryAccess", 
            public.userplantransaction."CommodityAccess", public.userplantransaction."TarrifCodeAccess", public.userplantransaction."Workspace", 
            public.userplantransaction."WSSLimit", public.userplantransaction."Downloadfacility", public.userplantransaction."Favoriteshipment", 
            public.userplantransaction."Whatstrending", public.userplantransaction."Companyprofile", public.userplantransaction."Addonfacility", 
            public.userplantransaction."Analysis", public.userplantransaction."User",("EndDate"- now()::date) AS Remainingdays FROM public."Cypher" 
            inner join public.userplantransaction on "Cypher"."${userIdColName}" = "userplantransaction"."UserId" inner join public.plan on 
            "userplantransaction"."PlanId" = "plan"."PlanId" inner join "Role" on "Cypher"."RoleId" = "Role"."RoleId" where "Email"=$1`;
    
            const userRes = await db?.query(getUserQuery, [Email]);
            if (userRes?.rows?.length > 0) {
                const doMatch = await compare(Password, userRes?.rows[0]?.Password);
                if (doMatch) {
                    const token = signJWTtoken(userRes?.rows[0]?.UserId, Email);               
                    userRes.rows[0].token = token;
                    return success(res, "SUCCESS", [userRes?.rows[0]], res?.statusCode)
                } else { return next(ErrorHandling?.unauthorizedError("Unauthorized Access")); }
            } else { return next(ErrorHandling?.notFoundError(userRes?.message, userRes)); }            
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };        
    },


    changePassword: async (req, res,next) => {
        try {
            const { Email, CurrentPassword, NewPassword } = req?.body;
    
            const getUserQuery = `SELECT "Password", "UserId" FROM public."Cypher" where "Email"=$1`;
    
            const user = await db.query(getUserQuery, [Email]);
            if (user?.rows?.length > 0) {
                const doMatch = await compare(CurrentPassword, user?.rows[0]?.Password);
                if (doMatch) {
                    const hashPassword = await hash(NewPassword, 12);
                    const updatePassword = `UPDATE public."Cypher" SET "Password"=$1 WHERE "UserId"=$2`;
    
                    db?.query(updatePassword, [hashPassword, user?.rows[0]?.UserId], (err, results) => {
                        if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); } 
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                } else { return next(ErrorHandling?.notFoundError("Incorrect Current password.")); }
            } else { return next(ErrorHandling?.notFoundError("User not found.")); }            
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };        
    },

    getErrorLogs: async(req, res, next) => {
        const filepath = `./public/logs/${req?.params?.date}.txt`;

        res?.setHeader("Content-Type", "text/plain", "charset=utf-8");

        const readStream = fs.createReadStream(filepath, {encoding: "utf-8"});

        readStream.on("error", (err) => {
            return next(ErrorHandling.internalServerError(err?.message, err));
        });

        readStream.pipe(res);
    }
}



