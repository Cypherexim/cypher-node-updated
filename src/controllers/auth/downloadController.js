import db from "../../config/database.js";
import { success } from "../../utils/response.js";
import { ErrorHandling } from "../../error/error.js";
import { getCurrentTableName } from "../../utils/utility.js";
import { extractCountry } from "../../utils/miscellaneous.js";
import { getDatabaseQuery, getquery } from "../../utils/common.js";
import { writeExcelFileService } from "../../services/excelWrite.js";


export const downloadingController = async (req, res, next) => {
    try {
        const { fromDate, toDate, HsCode, UserId, recordIds:selectedIds, CountryCode, direction, filename, countryType, totalDownloadCost } = req?.body;
        let isSubUser = false, parentuserid = 0, subUserId = 0, recordIds = selectedIds, searchedResult={};
        let {CountryName} = req?.body;
        const {tableName, statCountryName} = getCurrentTableName({countryType, direction, countryname:CountryName});
        const addDownloadWorkspaceQuery = `INSERT INTO public.userdownloadtransaction("countrycode", "userId", direction, "data_query", workspacename,datetime,"filePath","status","errorlog","expirydate") VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10) RETURNING public."userdownloadtransaction"."Id"`;
        const updateDownloadWorkspace = `UPDATE public.userdownloadtransaction SET "recordIds"= $1, "filePath"= $2, "status"= $3, "errorlog"= $4, "expirydate" = $5 WHERE "Id"= $6`;

        if(countryType==="MIRROR" && CountryName!=="china") {
            const extractedCountryName = extractCountry(CountryName);
            const countryKey = direction==="import" ? "CountryofDestination": "CountryofOrigin";
            if(Object.hasOwn(req?.body, countryKey)) { req?.body[countryKey].push(extractedCountryName); }
            else { req.body[countryKey] = [extractedCountryName]; }
        } else if(countryType==="STATISTICAL" && statCountryName!=="") {
            CountryName = statCountryName;
        }

        const userDetails = await db?.query(`SELECT "ParentUserId" FROM public."Cypher" where "UserId"=$1`, [UserId]);

        if (userDetails?.rows?.length > 0) {
            if (userDetails?.rows[0]?.ParentUserId != null) {
                isSubUser = true;
                parentuserid = userDetails?.rows[0]?.ParentUserId;
                subUserId = userDetails?.rows[0]?.UserId;
            }
        }

        if(totalDownloadCost>0) {
            const datetime = new Date();
            const workspaceNewAddRes = await db?.query(addDownloadWorkspaceQuery, [CountryCode, isSubUser ? subUserId : UserId, direction?.toUpperCase(), {}, filename, datetime, "", "In-Progress", "", datetime]);

            if(recordIds?.length==0) {
                const finalquery = await getDatabaseQuery({
                    body: req?.body,
                    tablename: tableName,
                    isOrderBy: false,
                    query: getquery(direction, CountryCode),
                    searchType: "data"
                });
                searchedResult = await db?.query(finalquery[0], finalquery[1].slice(1));
                const loopLen = searchedResult?.rows?.length;
                for(let i=0; i<loopLen; i++) recordIds?.push(searchedResult?.rows[i]["RecordID"]);
            } else {
                const queryStr = `select ${getquery(direction, CountryCode)} ${tableName} where "RecordID" IN (${recordIds})`;
                searchedResult = await db?.query(queryStr);
            }

            if(recordIds?.length < 500000) {
                const queryParam = {
                    UserId: isSubUser ? parentuserid : UserId,
                    direction, filename, fromDate, toDate, HsCode,
                    id: workspaceNewAddRes?.rows[0]?.Id, totalDownloadCost, recordIds
                };

                writeExcelFileService(searchedResult, queryParam);
                return success(res, "SUCCESS", [], res?.statusCode);
            } else {                
                await db?.query(updateDownloadWorkspace, [{}, '', 'Error', 'Exceeding Five Lacks Records!', workspaceNewAddRes?.rows[0]?.Id]);
                return next(ErrorHandling?.outOfLimitError("Exceeding Five Lacks Records."));
            }
        } else {
            return next(ErrorHandling?.creditRequiredError("Insufficient Donwloading Points"));
        }
    } catch (error) {
        return next(ErrorHandling?.internalServerError(`Error occured due to - ${error?.message}`, error));
    }
}
