import db from '../../../config/database.js';
import { ErrorHandling } from '../../../error/error.js'
// import { validateResult } from '../../../middlewares/validateResult.js';
import { success } from '../../../utils/response.js';

export const planAdminController = {
    createPlan : async (req, res,next) => {
        try {
            const { PlanName, Amount, Validity, DataAccess, Downloads, Searches, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, 
                WSSLimit, Downloadfacility, Favoriteshipment, Whatstrending, Companyprofile, Contactdetails, Addonfacility, Analysis, User, PlanId } = req?.body;
                
            if (PlanId != undefined && PlanId != null) {
                const sqlQuery =`UPDATE public.userplantransaction SET "Searches" = $1 WHERE "UserId"= $2`

                db?.query(sqlQuery, [PlanName, Amount, Validity, DataAccess, Downloads, Searches, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, Favoriteshipment, Whatstrending, Companyprofile, Contactdetails, Addonfacility, Analysis, User, PlanId], (err, result) => {
                    if (!err) { return success(res, "UPDATED", [], res?.statusCode); } 
                    else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                });
            } else {
                const sqlQuery = `SELECT * FROM public.plan WHERE "PlanName"=$1`;
                const planRes = await db?.query(sqlQuery, [PlanName]);

                if (planRes?.rows?.length > 0) { return next(ErrorHandling?.dataAlreadyError("Plan name already exists", planRes)); }
                else {
                    const sqlQuery =`INSERT INTO public.plan("PlanName", "Amount", "Validity", "DataAccess", "Downloads", "Searches", "CountryAccess", 
                    "CommodityAccess", "TarrifCodeAccess", "Workspace", "WSSLimit", "Downloadfacility", "Favoriteshipment", "Whatstrending", "Companyprofile", 
                    "Contactdetails", "Addonfacility", "Analysis", "User") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`;

                    db?.query(sqlQuery, [PlanName, Amount, Validity, DataAccess, Downloads, Searches, CountryAccess, CommodityAccess, TarrifCodeAccess, Workspace, WSSLimit, Downloadfacility, Favoriteshipment, Whatstrending, Companyprofile, Contactdetails, Addonfacility, Analysis, User], (err, result) => {
                        if (!err) { return success(res, "INSERTED", [], res?.statusCode); }
                        else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                    });
                }
            }
        } catch (error) { return next(ErrorHandling?.internalServerError(error?.message, error)); } 
    },

    getPlanList : async (req, res, next) => {
        try {
            const getPlanlist =`SELECT "PlanId", "PlanName", "Amount", "Validity", "DataAccess", "Downloads", "Searches", 
            "CountryAccess", "CommodityAccess", "TarrifCodeAccess", "Workspace", "WSSLimit", "Downloadfacility", "Favoriteshipment", 
            "Whatstrending", "Companyprofile", "Contactdetails", "Addonfacility", "Analysis", "User" FROM public.plan`;

            db?.query(getPlanlist, (err, result) => {
                if(!err) { return next(ErrorHandling?.badRequestError(err?.message, err)); }
                else { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    }
}

