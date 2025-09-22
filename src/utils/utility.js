import { DateTime } from "luxon";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

import { extractCountry } from "./miscellaneous.js";
import environment from "../config/environment.js";


const queryCondition = (params) => {
    const loopLen = params.length;
    const conditions = [], values = [0];

    for(let i=0; i<loopLen; i++) {
        const placeholderNum = i+1;

        switch (params[i].eq) {
            case '=': {                
                conditions.push(`"${params[i].name}" = $${placeholderNum}`);
                values.push(params[i].value);
                break;
            }
            case '!=': {                
                conditions.push(`"${params[i].name}" != $${placeholderNum}`);
                values.push(params[i].value);
                break;
            }
            case '>=': {
                conditions.push(`"${params[i].name}" >= $${placeholderNum}`);
                values.push(params[i].value);
                break;
            }
            case '<=': {
                conditions.push(`"${params[i].name}" <= $${placeholderNum}`);
                values.push(params[i].value);
                break;
            }
            case '%_%': {
                conditions.push(`"${params[i].name}" ILIKE $${placeholderNum}`);
                values.push(`%${params[i].value}%`);
                break;
            }
            case 'IN': {
                conditions.push(`"${params[i].name}" IN ($${placeholderNum})`);
                values.push(params[i].value);
                break;
            }
            case '= ANY': {
                conditions.push(`"${params[i].name}" = ANY($${placeholderNum})`);
                values.push(params[i].value);
                break;
            }
            case 'ANY': {
                conditions.push(`"${params[i].name}" ILIKE ANY ($${placeholderNum})`);
                values.push(params[i].value);
                break;
            }
            case 'LIKE':
            case 'SIMILAR TO': {
                if(params[i].name === "ProductDesc") {
                    conditions.push(`"${params[i].name}" ILIKE $${placeholderNum}`);                
                } else {
                    conditions.push(`"${params[i].name}" SIMILAR TO ($${placeholderNum})`);
                }
                values.push(params[i].value);
                
                break;
            }
        }
    }    

    return [conditions, values];
}

export const getCurrentTableName = (tableDetails) => {
    const {countryType, direction, countryname} = tableDetails;
    const statisticalCountries = { Bolivia: "CUSTOM", Brazil: "CUSTOM", Mexico: "CUSTOM", Nicaragua: "CUSTOM", Turkey: "CUSTOM", Usa: "CUSTOM", Australia: "MIRROR", Canada: "MIRROR", Dominicanrepublic: "MIRROR", Egypt: "MIRROR", Elsalvador: "MIRROR", Guatemala: "MIRROR", Honduras: "MIRROR", Israel: "MIRROR", Japan: "MIRROR", Newzealand: "MIRROR", Puertorico: "MIRROR", Spain: "MIRROR", Taiwan: "MIRROR", Thailand: "MIRROR", Unitedkingdom: "MIRROR" };
    let tableName = "", statCountryName = "";

    if(countryType==="MIRROR") {
        if(countryname=="china") { tableName = `${direction}_china`; } 
        else { tableName = `${direction}_mirror`; }
    } else if(countryType=="CUSTOM") {
        tableName = `${direction.toLowerCase()}_${countryname.toLowerCase()}`;
    } else if(countryType==="STATISTICAL") {
        const countryName = countryname[0].toUpperCase() + countryname.slice(1).toLowerCase(); 
        const staticCountryType = statisticalCountries[countryName];
        tableName = `${direction}_${staticCountryType==="MIRROR" ? "mirror" : countryname.toLowerCase()}`;
        if(staticCountryType==="MIRROR") { statCountryName = extractCountry(countryName); }
    }

    return {tableName, statCountryName};
}

export const generateFilterQuery = (params, selectQuery, tablename) => {
    let conditions=[], values = []

    if (params.length == 0) {return false;}

    [conditions, values] = queryCondition(params);
    
    const build = {
        where: conditions.length ? conditions.join(' AND ') : '1',
        values: values
    };
    
    const query = `SELECT ${selectQuery} ${tablename} WHERE ${build.where}`;

    return [query, build.values];
}

export const generateParams = (name, eq, value) => {
    let queryValue = value;
    if(["Imp_Name", "Exp_Name"].includes(name)) {
        const commonInitialsList = findMultipleCommonInitialText(value);
        queryValue = commonInitialsList.length!==0 ? commonInitialsList: value;        
    }

    return {
        name: name,
        eq: eq,
        value: queryValue
    }
}

export const formatDate = (date) => {
    const padTo2Digits = (num) => num.toString().padStart(2, '0');

    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
}

export const getCurrentIndianTime = () => {
    const currentTimestamp = new Date().valueOf();
    const utcTime = DateTime.fromMillis(currentTimestamp, { zone: "UTC" });
    const indianTime = utcTime.setZone("Asia/Kolkata");

    return indianTime;
}


export const getAwsSecretValues = async() => {    
    try {
        const secretsClient = new SecretsManagerClient({region: environment?.region});

        const command = new GetSecretValueCommand({SecretId: environment?.secretId});
        const response = await secretsClient.send(command);

        // If the secret is a string
        if (response.SecretString) {
            return JSON.parse(response.SecretString); //Assuming it's a JSON string
        }

        // If the secret is binary (rare case)
        const buff = Buffer.from(response.SecretBinary, 'base64');
        return buff.toString('ascii');
    } catch (error) {
        console.error('Error getting secret:', error);
        throw error;
    }
}

export const companyProfileStartDate = (date) => {
    const today = new Date(date);
    const lastYearDate = new Date(date);
    lastYearDate.setFullYear(today.getFullYear() - 1);
    return lastYearDate.toISOString().split('T')[0];
}

const getCommonInitialText = (searchList) => {
    if(searchList.length === 0) return "";
    if(searchList.length === 1) return searchList[0];

    let commonText = "";
    const sortedSearchingList = searchList.sort();
    const firstListItem = sortedSearchingList[0];
    const lastListItem = sortedSearchingList.at(-1);
    const minLength = Math.min(firstListItem.length, lastListItem.length);

    for(let i=0; i<minLength; i++) {
        if(firstListItem[i] === lastListItem[i]) {
            commonText += firstListItem[i];
        } else break;
    }

    return commonText;
}

const findMultipleCommonInitialText = (searchList) => {
    if([null, undefined].includes(searchList) || searchList.length===0) return [];

    const prefixes = [];
    let groupStartIndex = 0;
    searchList.sort();

    for(let i=1; i<searchList.length; i++) {
        if(searchList[i][0] !== searchList[i-1][0]) {
            const group = searchList.slice(groupStartIndex, i);
            const prefix = getCommonInitialText(group);
            prefixes.push(prefix.trim()+"%");
            groupStartIndex = i;          
        }
    }

    const lastGroup = searchList.slice(groupStartIndex);
    if(![null, undefined].includes(lastGroup) || lastGroup.length!==0) {
        const lastPrefix = getCommonInitialText(lastGroup);
        prefixes.push(lastPrefix.trim()+"%");
    }

    return prefixes;
}


