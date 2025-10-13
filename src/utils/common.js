import db from "../config/database.js";
import { countryDownloadingCols, searchingCountryColumns } from "./miscellaneous.js";
import { generateParams, generateFilterQuery } from "../utils/utility.js";
import { unionCompanyGenerator, unionBothCompanyGenerator } from "./queryUnionGen.js";

export const deductSearches = async (UserId, IsWorkspaceSearch) => {
    const sqlQuery = `SELECT "Downloads", "Searches" FROM public.userplantransaction WHERE "UserId"=$1`;
    const sqlQuery2 = `UPDATE public.userplantransaction SET "Searches" = $1 WHERE "UserId"= $2`;

    const planDetails = await db.query(sqlQuery, [UserId]);

    if (!IsWorkspaceSearch) {
        if (planDetails.rows.length>0 && planDetails.rows[0] != null) {
            if (planDetails.rows[0].Searches > 0 || planDetails.rows[0].Searches == 'Unlimited') {
                const latestSearchCount = Number(planDetails.rows[0].Searches) - 1;
                await db.query(sqlQuery2, [latestSearchCount, UserId]);
                return true;
            } else { return false; }
        } else { return false; }
    } else { return true; }
}

export const getDatabaseQuery = async (args) => {
    return new Promise(async(resolve, reject) => {
        const {body, tablename, isOrderBy, query,  searchType=""} = args;
        const {fromDate, toDate, HsCode, ProductDesc, Imp_Name, Exp_Name, CountryofOrigin,
            CountryofDestination, Month, Year, uqc, Quantity, PortofOrigin, PortofDestination,
            Mode, LoadingPort, NotifyPartyName, Currency, page=0, itemperpage=0 } = body;

        const params = [];
        const searchFinalType = searchType.includes("-") ? searchType.split("-")[0]: searchType;
        const isUnionAllow = ["data","analysis","sidefilter"].includes(searchFinalType);
        const [direction, country] = tablename.split("_");
        const selectQuery = query==="" ? `${searchingCountryColumns(direction, country)} FROM` : query;
        const doesExist = (colName) => !(["", null, undefined].includes(colName));

        
        if (doesExist(ProductDesc)) {
            if (ProductDesc.length > 0) {
                ProductDesc.forEach(element => {
                    if (doesExist(element)) { params.push(generateParams("ProductDesc", "SIMILAR TO", `%${element}%`)); }
                });
            }
        }
                
        if (doesExist(fromDate)) { params.push(generateParams("Date", ">=", fromDate)); }
        if (doesExist(toDate)) { params.push(generateParams("Date", "<=", toDate)); }
        if (doesExist(HsCode)) { params.push(generateParams("HsCode", "LIKE", `(${HsCode.join("|")})%`)); }
        if (doesExist(CountryofOrigin)) { params.push(generateParams("CountryofOrigin", "ANY", CountryofOrigin)) }
        if (doesExist(CountryofDestination)) { params.push(generateParams("CountryofDestination", "ANY", CountryofDestination)) }
        if (doesExist(Month)) { params.push(generateParams("Month", "ANY", Month)) }
        if (doesExist(Year)) { params.push(generateParams("Year", "= ANY", Year)) }
        if (doesExist(uqc)) { params.push(generateParams("uqc", "ANY", uqc)) }
        if (doesExist(Quantity)) { params.push(generateParams("Quantity", "<=", Quantity)) }
        if (doesExist(Currency)) { params.push(generateParams("Currency", "ANY", Currency)) }
        if (doesExist(PortofOrigin)) { params.push(generateParams("PortofOrigin", "ANY", PortofOrigin)) }
        if (doesExist(PortofDestination)) { params.push(generateParams("PortofDestination", "ANY", PortofDestination)) }
        if (doesExist(Mode)) { params.push(generateParams("Mode", "ANY", Mode)) }
        if (doesExist(LoadingPort)) { params.push(generateParams("LoadingPort", "ANY", LoadingPort)) }
        if (doesExist(NotifyPartyName)) { params.push(generateParams("NotifyPartyName", "ANY", NotifyPartyName)) }   
        if (!isUnionAllow && doesExist(Imp_Name)) { params.push(generateParams("Imp_Name", "ANY", Imp_Name)); } //multi push
        if (!isUnionAllow && doesExist(Exp_Name)) { params.push(generateParams("Exp_Name", "ANY", Exp_Name)); } //multi push
                
        let querytoexecute = generateFilterQuery(params, selectQuery, tablename);        
        
        if(isUnionAllow) {
            if(doesExist(Imp_Name) && doesExist(Exp_Name)) {
                querytoexecute[0] = await unionBothCompanyGenerator({
                    partialQuery: querytoexecute[0], 
                    companyColNames: ["Imp_Name", "Exp_Name"], 
                    companyList: [Imp_Name, Exp_Name], 
                    direction: direction,
                    searchType
                });
            } else if(doesExist(Imp_Name) || doesExist(Exp_Name)) {
                const isImporterExist = doesExist(Imp_Name);
                const columnName = isImporterExist ? "Imp_Name": "Exp_Name";
                const companiesList = columnName==="Imp_Name" ? Imp_Name: Exp_Name;

                querytoexecute[0] = await unionCompanyGenerator({
                    partialQuery: querytoexecute[0], 
                    companyColName: columnName, 
                    companyList: companiesList, 
                    searchType: searchType
                });
            } else {
                const addOn = ["sidefilter","analysis"].includes(searchType.split("-")[0]) ? ` GROUP BY ${searchType.split("-")[1]}`: "";
                querytoexecute[0] += addOn;
            }
        } 
        const finalQuery = querytoexecute[0] + (isOrderBy ? ` ORDER BY "Date" DESC LIMIT ${Number(itemperpage)} OFFSET ${(Number(page) - 1) * Number(itemperpage)}` : "");
                
        return resolve([finalQuery, querytoexecute[1]]);
    });
}




export const getCountryDetails = (pathName) => {
    const countryDirection = pathName.replace("/get", "");
    const isExport = countryDirection.includes("Export");

    if(isExport) {
        const countryName = countryDirection.substring(0, countryDirection.match(/E(?!.*E)/)?.index).toLowerCase();
        return {country: countryName, direction: "export"};
    } else {
        const countryName = countryDirection.substring(0, countryDirection.match(/I(?!.*I)/)?.index).toLowerCase();
        return {country: countryName, direction: "import"};
    }
}

export const getPreRequiredDataForFurtherFetching = (params) => {
    return new Promise((resolve, reject) => {
        try {
            const {countryType, Direction, countryname, statCountryName, body} = params;
            let countryName = "";

            if(countryType==="MIRROR" && countryname!=="china") {
                const extractedCountryName = extractCountry(countryname);
                const countryKey = Direction=="import" ? "CountryofDestination": "CountryofOrigin";

                if(Object.hasOwn(body, countryKey)) {body[countryKey].push(extractedCountryName);}
                else {body[countryKey] = [extractedCountryName];}
            } else if(countryType==="STATISTICAL" && statCountryName!=="") {
                countryName = statCountryName;
            }

            resolve({countryName});
        } catch (error) { reject(error); }        
    });
}

export const deductDownload = async(recordtobill, countrycode, userId) => {
    const sqlQuery1 = `SELECT "Downloads", "Searches" FROM public.userplantransaction WHERE "UserId"=$1`;
    const sqlQuery2 = `SELECT * FROM public."Dowload_cost" WHERE "CountryCode"=$1 AND "CountryType"=$2`;
    const sqlQuery3 = `UPDATE public.userplantransaction SET "Downloads" = $1 WHERE "UserId"= $2`;
    
    const planDetails = await db?.query(sqlQuery1, [userId]);
    
    if (planDetails?.rows[0] !== null) {
        db?.query(sqlQuery2, [countrycode], async(err, result) => {
            if (!err) {
                const totalpointtodeduct = (planDetails?.rows[0]?.Downloads - (result?.rows[0]?.CostPerRecord * recordtobill));
                await db?.query(sqlQuery3, [totalpointtodeduct, userId]);
            }
        });
    }
}

export const getheaderarray = (row) => {
    const columns = [];

    for (const prop in row) columns?.push(prop);
    
    return columns;
}

export const getDataHeaders = (row) => {
    const columns = [];
    const calculatedwidthSizes = {
        VENDOR: 40,
        BUYER: 50,
        "ITEM DESCRIPTION": 125,
        "BUYER ADDRESS": 100
    };

    for (const prop in row) {
        let calculatedwidth = 12;

        if(calculatedwidthSizes[prop]) {
            calculatedwidth = calculatedwidthSizes[prop];
        } else { calculatedwidth = prop.length < 12 ? 14 : (prop.length + 15); }
        
        columns.push({ header: prop, key: prop, width: calculatedwidth });
    }

    return columns;
}

export const getquery = (direction, CountryCode) => {
    if (CountryCode === 'IND') {
        return countryDownloadingCols?.INDIA_COLUMNS_DOWNLOAD(direction);
    } else if(CountryCode === "WEE") {
        return countryDownloadingCols?.WEEKLY_COLUMNS_DOWNLOAD(direction);
    } else { return '* FROM';}
}

export const getavailableFieldlist = async (tablename, countryType="") => {    
    const fieldList = {
        totalValueCount: 'ValueInUSD', 
        buyerCount: 'Imp_Name', 
        supplierCount: 'Exp_Name',
        hscodeCount: 'HsCode',
        countryCount: tablename.toLowerCase().includes('import') ? 'CountryofOrigin' : 'CountryofDestination'
    };
    if(countryType === "STATISTICAL") {
        delete fieldList?.buyerCount;
        delete fieldList?.supplierCount;
    }
    const keyFinder = (value) => Object?.keys(fieldList)?.filter(key => fieldList[key] === value)[0];

    const {rows, rowCount} = await db?.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 and column_name = ANY($2)`, [tablename, Object.values(fieldList)]);

    if (rowCount > 0) {
        const uniqueCountQueries = [];

        for(let i=0; i<rowCount; i++){
            const colName = rows[i]?.column_name;

            if(colName?.toString()==='ValueInUSD') {
                uniqueCountQueries?.push(`ROUND(SUM("ValueInUSD")::numeric, 2) as ${keyFinder(`${colName.toString()}`)}`);
            } else {
                uniqueCountQueries?.push(`COUNT(distinct "${colName?.toString()}") as ${keyFinder(`${colName.toString()}`)}`);
            }
        }

        const query = `${uniqueCountQueries?.toString()}, COUNT(*) as totalRecordsCount FROM`;
        
        return [query];
    } else return "";
}
