export const unionCompanyGenerator = (args) => {
    return new Promise((resolve, reject) => {
        try {
            const { partialQuery, companyColName, companyList, searchType } = args;
            const unionSections = [];

            const addOn = ["sidefilter","analysis"].includes(searchType.split("-")[0]) ? ` GROUP BY ${searchType.split("-")[1]}`: "";

            for(let i=0; i<companyList?.length; i++) {
                const sections = `(${partialQuery} AND "${companyColName}" ILIKE '${companyList[i]}' ${addOn})`;
                unionSections.push(sections);
            }

            const unionOrientedQuery = unionSections?.join(" UNION ALL ");

            resolve(unionOrientedQuery);
        } catch (error) {
            reject(error);
        }
    });
}

export const unionBothCompanyGenerator = (args) => {
    return new Promise((resolve, reject) => {
        try {
            const { partialQuery, companyColNames, companyList, direction, searchType } = args;
            const queryOptions = {
                importColName: companyColNames[0],
                exportColName: companyColNames[1],
                importersList: companyList[0],
                exportersList: companyList[1]
            };

            const unionSections = [];
            const loopLen = direction==="export" ? queryOptions?.exportersList.length: queryOptions?.importersList?.length;

            const addOn = ["sidefilter","analysis"].includes(searchType.split("-")[0]) ? ` GROUP BY ${searchType.split("-")[1]}`: "";

            for(let i=0; i<loopLen; i++) {
                const sections = direction==="export" 
                ? `(${partialQuery} AND "${queryOptions?.exportColName}" ILIKE '${queryOptions?.exportersList[i]}' AND "${queryOptions?.importColName}" IN (${queryOptions?.importersList?.map(txt => `'${txt}'`)?.toString()}) ${addOn})`
                : `(${partialQuery} AND "${queryOptions?.importColName}" ILIKE '${queryOptions?.importersList[i]}' AND "${queryOptions?.exportColName}" IN (${queryOptions?.exportersList?.map(txt => `'${txt}'`)?.toString()}) ${addOn})`
                
                unionSections.push(sections);
            }

            const unionOrientedQuery = unionSections?.join(" UNION ALL ");

            resolve(unionOrientedQuery);
        } catch (error) {
            reject(error);
        }
    });
}


export const counterOrientedQueryGen = (args) => {
    return new Promise((resolve, reject) => {
        try {        
            let { importers, exporters, partialQuery } = args;
            let importQuery = "", exportQuery = "";
        
            if(importers?.length>0 && exporters?.length>0) {
                for(let i=0; i<importers?.length; i++) { importQuery += `"Imp_Name" ILIKE '${importers[i]}' OR `; }
                for(let j=0; j<exporters?.length; j++) { exportQuery += `"Imp_Name" ILIKE '${exporters[j]}' OR `; }
        
                partialQuery += ` AND (${importQuery?.substring(0, importQuery?.length-4)}) AND (${exportQuery?.substring(0, exportQuery?.length-4)})`;
                resolve(partialQuery);
            } else {
                if(importers?.length>0) {
                    for(let i=0; i<importers?.length; i++) { importQuery += `"Imp_Name" ILIKE '${importers[i]}' OR `; }
                    partialQuery += ` AND (${importQuery?.substring(0, importQuery?.length-4)})`;
                    resolve(partialQuery);
                } else if(exporters?.length>0) {
                    for(let j=0; j<exporters?.length; j++) { exportQuery += `"Imp_Name" ILIKE '${exporters[j]}' OR `; }
                    partialQuery += ` AND (${exportQuery?.substring(0, exportQuery?.length-4)})`;
                    resolve(partialQuery);
                }
            }
        } catch (error) { reject(error); }
    });
}

export const setWithGroupQuerySidefilter = (columnName, query) => {
    const colName = columnName.includes('"') ? columnName: `"${columnName}"`;
    const initialStatement = 'WITH "GroupDataTable" AS (';
    const finalStatement = `) select distinct ${colName}, sum(valueinusd) as valueinusd from "GroupDataTable" group by ${colName}`;

    return initialStatement + query + finalStatement;
}

export const setWithGroupQueryAnalysis = (columnName, query) => {
    const colName = columnName.includes('"') ? columnName: `"${columnName}"`;
    const initialStatement = 'WITH "GroupDataTable" AS (';
    const finalStatement = `) select distinct ${colName}, sum(valueinusd) as ValueInUSD, sum(Quantity) as Quantity, sum(UnitPriceFC) as UnitPriceFC  from "GroupDataTable" group by ${colName}`;

    return initialStatement + query + finalStatement;
}

export const setWithGroupQueryCounters = (columnName, query) => {
    const colName = columnName.includes('"') ? columnName: `"${columnName}"`;
    const initialStatement = 'WITH "GroupDataTable" AS (';
    const finalStatement = `) select distinct ${colName}, sum(valueinusd) as ValueInUSD, sum(Quantity) as Quantity, sum(UnitPriceFC) as UnitPriceFC  from "GroupDataTable" group by ${colName}`;

    return initialStatement + query + finalStatement;
}

