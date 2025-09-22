const partialQuery = `SELECT "RecordID","Type","Date","HsCode","ProductDesc","Exp_Name","Imp_Name","CountryofOrigin",
"uqc","Mode","Quantity","Currency","UnitPriceFC","InvValueFC","Duty_USD","Duty_PCNTG","Exchange_Rate",
"Importer_Value_USD","ValueInUSD","PortofOrigin","PortofDestination","BE_NO" FROM import_india 
WHERE "Date" >= '2025-01-01' AND "Date" <= '2025-07-31'`;
const limitOffset = ` ORDER BY "Date" DESC LIMIT 25 OFFSET 0`;
const companiesList = [
    'JALON ( THAILAND)CO.LIMITED',
    'JALON (THAILAND ) CO. LIMITED',
    'JALON (THAILAND) CO LIMITED',
    'JALON (THAILAND) CO. LIMITED',
    'JALON (THAILAND) CO., LIMITED',
    'JALON (THAILAND) CO.LIMITED',
    'JALON THAILAND CO LIMITED',
    'JALON THAILAND CO..LIMITED',
    'JALON(THAILAND)CO LIMITED',
];
const Imp_Name = [ 
    "REDA CHEMICALS INDIA PRIVATE LIMITED", 
    "AMCHEM PRODUCTS PRIVATE LIMITED", 
    "CILICANT PRIVATE LIMITED", 
    "AGC CHEMICALS PRIVATE LIMITED" 
];
// const completeQuery = [];

// for(let i=0; i<companiesList?.length; i++) {
//     const query = `(${partialQuery} AND "Exp_Name" ILIKE '${companiesList[i]}')`;
//     completeQuery.push(query);
// }

// const finalQuery = completeQuery.join(" UNION ALL ") + limitOffset;
// console.log(finalQuery);




const unionBothCompanyGenerator = async(args) => {
    return new Promise((resolve, reject) => {
        try {
            const { partialQuery, companyColNames, companyList, direction } = args;
            const queryOptions = {
                importColName: companyColNames[0],
                exportColName: companyColNames[1],
                importersList: companyList[0],
                exportersList: companyList[1]
            };

            const unionSections = [];
            const loopLen = direction==="export" ? queryOptions?.exportersList.length: queryOptions?.importersList?.length;

            for(let i=0; i<loopLen; i++) {
                const sections = direction==="export" 
                ? `(${partialQuery} AND "${queryOptions?.exportColName}" ILIKE '${queryOptions?.exportersList[i]}' AND "${queryOptions?.importColName}" IN (${queryOptions?.importersList?.map(txt => `'${txt}'`)?.toString()}))`
                : `(${partialQuery} AND "${queryOptions?.importColName}" ILIKE '${queryOptions?.importersList[i]}' AND "${queryOptions?.exportColName}" IN (${queryOptions?.exportersList?.map(txt => `'${txt}'`)?.toString()}))`
                
                unionSections.push(sections);
            }

            const unionOrientedQuery = unionSections?.join(" UNION ALL ");

            resolve(unionOrientedQuery);
        } catch (error) {
            reject(error);
        }
    });
}

(async() => {
    const strQuery = await unionBothCompanyGenerator({ 
        partialQuery, 
        companyColNames: ["Imp_Name", "Exp_Name"], 
        companyList: [Imp_Name, companiesList], 
        direction: "import"
    });

    console.log(strQuery);
})();





