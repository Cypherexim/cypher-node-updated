import db from '../config/database.js';
import { extractCountry } from "./miscellaneous.js"
import { formatDate, companyProfileStartDate, getCurrentTableName } from './utility.js';

export const companyHandleGen = async(body, type) => {
    return new Promise(async(resolve, reject) => {
        try {
            const { date, countryname, companyname, direction, sameCompanyCountry, countryType, page } = body;

            let selectedfields = "";
            const dateTo = formatDate(new Date(date));
            const dateFrom = companyProfileStartDate(date);

            const { tableName } = getCurrentTableName({ countryType, direction, countryname });
            const countryKey = direction==="import" ? "CountryofDestination" : "CountryofOrigin";

            if (countryType === "MIRROR" && countryname !== "china") {
                const extractedCountryName = extractCountry(countryname);
                if (Object.hasOwn(req?.body, countryKey)) { req?.body[countryKey]?.push(extractedCountryName); }
                else { req.body[countryKey] = [extractedCountryName]; }
            }

            const companyColName = sameCompanyCountry 
                ? direction?.toLowerCase()==="import" ? "Imp_Name" : "Exp_Name" 
                : direction?.toLowerCase() === "import" ? "Exp_Name" : "Imp_Name";

            const availableFileds = await getAvailableFields({ type, direction, tableName, sameCompanyCountry });
            if(type === "count") {
                const allColNamesInArray = availableFileds?.map(rowObj => rowObj?.column_name);
                selectedfields = getQueryOnCounts(allColNamesInArray);
            } else {
                availableFileds?.forEach(item => { 
                    selectedfields += type==="pivot" && item?.column_name==="ValueInUSD" ?  `SUM("${item?.column_name}"),`: `"${item?.column_name}",`; 
                });
            }

            const inCaseOfMirrorCountry = countryType === 'MIRROR' ? `"${countryKey}" ilike '${req?.body[countryKey]}' AND` : "";
            const groupByOnPivot = type==="pivot" ? `group by "${direction==="import" ? "CountryofOrigin": "CountryofDestination"}", "HsCode", "Imp_Name", "Exp_Name"`: '';

            let query = `SELECT ${selectedfields?.replace(/,\s*$/, "")} FROM ${tableName} where "Date" >= $1 AND "Date" <= $2 AND ${inCaseOfMirrorCountry} "${companyColName}" like '%${companyname}%' ${groupByOnPivot}`;

            if(type==="shipment")  { query += `offset ${(page-1)*100} limit 100`; }

            resolve({ query, date: {dateTo, dateFrom} });
        } catch (error) { reject(null); }
    });
}

const getAvailableFields = async(args) => {
    const { type, direction, tableName, sameCompanyCountry } = args;
    const fieldList = ((type) => {
        if(type === "shipment") {
            return ["'Exp_Name'", "'Imp_Name'", "'HsCode'", "'Quantity'", "'ValueInUSD'", "'CountryofDestination'",  "'CountryofOrigin'"].concat(sameCompanyCountry ? ["'Exp_Address'", "'Exp_City'", "'Exp_PIN'", "'Exp_Phone'", "'Exp_Email'", "'Importer_Address'", "'Importer_City'", "'Importer_PIN'", "'Importer_Phone'", "'Importer_Email'"].toLocaleString() : []);
        } else {
            const fieldList = type==="pivot"? ["'HsCode'", "'ValueInUSD'"]: ["'RecordID'", "'HsCode'", "'ValueInUSD'", "'Quantity'"];
            fieldList.push(...(direction==="import" ? ["'Exp_Name'", "'CountryofOrigin'"]: ["'Imp_Name'", "'CountryofDestination'"]));
            return fieldList;
        }
    })(type);

    const sqlQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name in (${fieldList?.toString()})`;
    const availablefield = await db?.query(sqlQuery, [tableName]);
    
    return availablefield?.rows;
}

const getQueryOnCounts = (colNames) => {
    let sqlQuery = "";

    for(let i=0; i<colNames.length; i++) {
        if(["HsCode", "Exp_Name", "CountryofOrigin", "Imp_Name", "CountryofDestination"].includes(colNames[i])) {
            sqlQuery += `COUNT(DISTINCT "${colNames[i]}") AS "${colNames[i]}", `;
        } else if(["Quantity", "ValueInUSD"].includes(colNames[i])) {   
            sqlQuery += `SUM("${colNames[i]}") AS "${colNames[i]}", `;
        } else {
            sqlQuery += `COUNT("${colNames[i]}") as Total, `;
        }
    }

    return sqlQuery.substring(0, (sqlQuery.length-2));
}
