import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";


export const generalController = {
    getSideFilterAccess: async (req, res, next) => {
        try {
            const { Country, Direction, Type } = req?.query;
            const sqlQuery = `SELECT "Id", "HsCode", "ProductDesc", "Exp_Name", "Imp_Name", "CountryofDestination", "CountryofOrigin", "PortofOrigin", "Mode", "uqc", "Quantity", "Month", "Year", "Country", "Direction", "PortofDestination", "LoadingPort", "Currency", "NotifyPartyName", "CountryType" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3 AND active=true`;

            db.query(sqlQuery, [Country, Direction.toUpperCase(), Type], (err, results) => {
                if (!err) { return success(res, "SUCCESS", results.rows, res.statusCode); } 
                else { return next(ErrorHandling.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling.internalServerError(err?.message, err)); };
    },

    addupdateAccessSideFilter: async(req, res, next) => {
        try {
            const { HsCode, ProductDesc, Exp_Name, Imp_Name, CountryofDestination, CountryofOrigin, PortofOrigin, Mode, 
            uqc, Quantity, Month, Year, Country, PortofDestination, LoadingPort, Currency, NotifyPartyName, Direction, Id, CountryType } = req.body;
            const sqlQuery = `SELECT "Id", "HsCode", "ProductDesc", "Exp_Name", "Imp_Name", "CountryofDestination", 
            "CountryofOrigin", "PortofOrigin", "Mode", "uqc", "Quantity", "Month", "Year", "Country", "Direction", 
            "PortofDestination", "LoadingPort", "Currency", "NotifyPartyName", "CountryType" FROM public."SideFilterAccess" 
            where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3 AND active=true`;
            
            const sqlQuery2 = `UPDATE public."SideFilterAccess" SET "HsCode"=$2, "ProductDesc"=$3, "Exp_Name"=$4, "Imp_Name"=$5, 
            "CountryofDestination"=$6, "CountryofOrigin"=$7, "PortofOrigin"=$8, "Mode"=$9, "uqc"=$10, "Quantity"=$11, "Month"=$12, 
            "Year"=$13, "PortofDestination"=$14, "LoadingPort"=$15, "Currency"=$16, "NotifyPartyName"=$17 WHERE "Id"=$1 and "CountryType"=$18`;

            const access = await db?.query(sqlQuery, [Country, Direction?.toUpperCase(), CountryType]);
            if (access?.rows?.length > 0) {
                const params = [Id, HsCode, ProductDesc, Exp_Name, Imp_Name, CountryofDestination, CountryofOrigin, PortofOrigin, Mode, uqc, Quantity, Month, Year, PortofDestination, LoadingPort, Currency, NotifyPartyName, CountryType];
                db.query(sqlQuery2, params, (err, result) => {
                    if (!err) { return success(res, "UPDATE", result.rows, res.statusCode); } 
                    else { return next(ErrorHandling.badRequestError(err?.message, err)); }
                });
            }
        } catch (err) { return next(ErrorHandling.internalServerError(err?.message, err)); };
    },

    getcommonimportlist: async (req, res, next) => {
        try {
            const { countryname, text } = req?.query;

            if (text === null) {
                const sqlQuery = `SELECT * FROM ${countryname?.toLowerCase()}_companies order by "Imp_Name" limit 500`;
                db?.query(sqlQuery, (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling.notFoundError("Records are not found", err)); }
                });
            } else {
                const sqlQuery = `SELECT * FROM ${countryname?.toLowerCase()}_companies WHERE "Imp_Name" like $1 order by "Imp_Name" limit 500`;
                db?.query(sqlQuery, [text + '%'], (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling?.notFoundError("Records are not found", err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getcommonexportlist: async (req, res, next) => {
        try {
            const { countryname, text } = req?.query;

            if (text === null) {
                const sqlQuery = `SELECT * FROM ${countryname?.toLowerCase()}_participate_companies order by "Exp_Name" limit 500`;
                db?.query(sqlQuery, (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling?.notFoundError("Records are not found", err)); }
                });
            } else {
                const sqlQuery = `SELECT * FROM ${countryname?.toLowerCase()}_participate_companies WHERE "Exp_Name" like $1 order by "Exp_Name" limit 500`;
                db?.query(sqlQuery, [text + '%'], (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling?.notFoundError("Records are not found", err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getlatestDate: async (req, res, next) => {
        try {
            const { direction, countryType, countryName, countryCode } = req?.query;
            let CountryType = "";
            if(["STATISTICAL","MIRROR"]?.includes(countryType)) {
                if(countryType==="STATISTICAL" && Object.hasOwn(countryMappingViaType, countryName)) {
                    CountryType = !countryMappingViaType[countryName]["isCustom"] ? "MIRROR" : "CUSTOM";
                } else {CountryType = "MIRROR";}
            } else {CountryType = "CUSTOM";}

            db?.query(query?.getLatestDate, [CountryType, direction, countryCode], (error, results) => {
                if (!error) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(error?.message, error)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getHscode: async (req, res, next) => {
        try {
            const { digit } = req?.query;
            const allHsCodeQuery = `SELECT "Hscode","HscodeDesc" FROM public."HSCodes"`
            const filteredHsCodeQuery = `SELECT "Hscode" ,"HscodeDesc" FROM public."HSCodes" where length("Hscode") =$1`;

            if (digit === null) {
                db?.query(allHsCodeQuery, (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling?.notFoundError("Records are not found", err)); }
                });
            } else {
                db?.query(filteredHsCodeQuery, [digit], (err, results) => {
                    if (!err) { return success(res, "SUCCESS", results?.rows, res?.statusCode); }
                    else { return next(ErrorHandling?.notFoundError("Records are not found", err)); }
                });
            }
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getallcountries: async (req, res) => {
        try {
            const sqlQuery = `SELECT "id", "country" FROM public.all_countries Order by country`;

            db?.query(sqlQuery, (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    adduserActivitylog: async (req, res, next) => {
        try {
            const { UserId, IP, Email, date } = req?.body;
            const sqlQuery = `INSERT INTO public."UserActivityLog"("UserId", "Lastlogin", "IP","Email") VALUES ( $1, $2, $3, $4)`;
            
            db?.query(sqlQuery, [UserId, date, IP, Email], (err, result) => {
                if (!err) { return success(res, "INSERTED", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getAccountDetails: async (req, res, next) => {
        try {
            const { UserId } = req.query;            
            const parentUserId = await db.query(`SELECT "ParentUserId" FROM public."Cypher" where "UserId"=$1`, [UserId]);
            const id = parentUserId?.rows[0]?.ParentUserId!==null ? Number(ser.rows[0].ParentUserId): UserId;
            const sqlQuery = `SELECT "userplantransaction"."UserId", "userplantransaction"."PlanId", "userplantransaction"."Downloads", 
            "userplantransaction"."Searches", "userplantransaction"."StartDate", "userplantransaction"."EndDate", "userplantransaction"."Validity", 
            "userplantransaction"."DataAccess", "userplantransaction"."CountryAccess", "userplantransaction"."CommodityAccess", 
            "userplantransaction"."TarrifCodeAccess", "userplantransaction"."Workspace", "userplantransaction"."WSSLimit", 
            "userplantransaction"."Downloadfacility", "userplantransaction"."Favoriteshipment", "userplantransaction"."Whatstrending", 
            "userplantransaction"."Companyprofile", "userplantransaction"."Addonfacility", "userplantransaction"."Analysis", "userplantransaction"."User",
            "userplantransaction"."Downloads","plan"."PlanName","userplantransaction"."Searches",("EndDate"- now()::date) AS Remainingdays, 
            "AddUser", "EditUser", "DeleteUser", "AddPlan", "EditPlan", "DeletePlan", "UserAccess"."Downloads" as Dwnlds, "Search", "EnableId", 
            "DisableId", "BlockUser", "UnblockUser", "ClientList", "PlanList", "Share" FROM public.userplantransaction inner join "plan" on 
            "plan"."PlanId" = "userplantransaction"."PlanId" inner join "UserAccess" on "UserAccess"."UserId" = "userplantransaction"."UserId" WHERE "userplantransaction"."UserId"=$1`;

            db?.query(sqlQuery, [id], (err, results) => {
                if (!err) {
                    results.rows[0].UserId = UserId;
                    return success(res, "INSERTED", results?.rows, res?.statusCode);
                } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            })
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getProductDesc: async (req, res, next) => {
        try {
            const { product } = req.query;
            const sqlQuery = 'SELECT "Id", "Product", "ProductDesc" FROM public."Products" WHERE "Product" LIKE $1';

            db.query(sqlQuery, [product + '%'], (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getRoleList: async (req, res, next) => {
        try {
            const sqlQuery = `SELECT "RoleId", "RoleName" FROM public."Role"`;

            db.query(sqlQuery, (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },

    getAccessByRoleId: async (req, res, next) => {
        try {
            const sqlQuery = `SELECT * FROM "Role" inner join "RoleAccess" on "Role"."RoleId" = "RoleAccess"."RoleId" WHERE "Role"."RoleId"=$1`;

            db.query(sqlQuery, [req?.query?.Id], (err, result) => {
                if (!err) { return success(res, "SUCCESS", result?.rows, res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch (err) { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
    
    updateFavoriteShipment: async(req, res, next) => {
        try {
            const sqlQuery = 'update "userplantransaction" set "Favoriteshipment"="Favoriteshipment"::integer-1 where "UserId"=$1';

            db.query(sqlQuery, [req?.query?.userId], async(err, result) => {
                if (!err) { 
                    const selectQuery = `select "Favoriteshipment" from "userplantransaction" where "UserId"=$1`;
                    const response  = await db?.query(selectQuery, [userId]);
                    const remaining = { remaining: response.rows[0]?.Favoriteshipment || 0};
                    return success(res, "SUCCESS", [remaining], res?.statusCode);
                } else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
    
    updateCompanyPoints: async(req, res, next) => {
        try {
            const sqlQuery = 'update "userplantransaction" set "Companyprofile"="Companyprofile"::integer-1 where "UserId"=$1 returning "Companyprofile"';
            
            db?.query(sqlQuery, [req?.query?.userId], (err, result) => {
                if (!err) {
                    const remaining = { remaining: result?.rows[0]["Companyprofile"] };
                    return success(res, "SUCCESS", [remaining], res?.statusCode); }
                else { return next(ErrorHandling?.badRequestError(err?.message, err)); }
            });
        } catch { return next(ErrorHandling?.internalServerError(err?.message, err)); };
    },
};



