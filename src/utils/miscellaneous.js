import { body } from "express-validator";

export const sideFiltersQuery = {
    GET_HSCODE_ACCESS: `SELECT "HsCode" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_IMPORT_ACCESS: `SELECT "Imp_Name" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_EXPORT_ACCESS: `SELECT "Exp_Name" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_COUNTRY_ACCESS: `SELECT "CountryofDestination", "CountryofOrigin" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_PORT_OF_DESTINATION_ACCESS: `SELECT "PortofDestination" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_PORT_OF_ORIGIN_ACCESS: `SELECT "PortofOrigin" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_MONTH_ACCESS: `SELECT "Month" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_YEAR_ACCESS: `SELECT "Year" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_CURRENCY_ACCESS: `SELECT "Currency" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_UQC_ACCESS: `SELECT "uqc" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_MODE_ACCESS: `SELECT "Mode" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_QUANTITY_ACCESS: `SELECT "Quantity" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_LOADING_PORT_ACCESS: `SELECT "LoadingPort" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`,
    GET_NOTIFY_PARTY_ACCESS: `SELECT "NotifyPartyName" FROM public."SideFilterAccess" where "Country"=$1 AND "Direction"=$2 AND "CountryType"=$3`
};

export const countryDownloadingCols = {
    WEEKLY_COLUMNS_DOWNLOAD: (direction) => direction==='import' 
        ? '"RecordID", "Date", "HsCode", "Exp_Name", "Imp_Name", "CountryofOrigin", "ProductDesc", "Quantity", "uqc", "BE_NO", "IEC",  "Currency", , "PortofOrigin", "PortofDestination", "Invoice_NO", "AssetValueINR", "UnitPriceFC", "DutyINR", "port_code", "Mode", "ValueInUSD" from'
        : '"RecordID", "Date", "HsCode", "Exp_Name", "Imp_Name", "CountryofDestination", "ProductDesc", "Quantity", "uqc", "SB_NO", "IEC",  "Mode", "Currency", "FOB", "PortofOrigin", "PortofDestination", "Item_NO", "Invoice_NO", "UnitPriceFC", "Drawback", "port_code", "ValueInUSD" from',
    INDIA_COLUMNS_DOWNLOAD: (direction) => direction==='export'
        ?'"RecordID", "Type" as "DIRECTION","Date" as "DATE","Month" as "MONTH","Year" as "YEAR","HsCode" as	"TARIFF CODE","HSCode2dig" as "TWO_DIGIT","HSCode4Dig" as "FOUR_DIGIT","ProductDesc" as "ITEM DESCRIPTION","CommodityDesc" as "COMMODITY_DESCRIPTION","uqc"	as "UQC","Quantity" as "QTY","Currency"	as "CURRENCY","UnitPriceFC" as "UNT PRICE FC","InvValueFC" as "EST_VALUE FC","ValueInUSD" as "EST VALUE US$","CountryofDestination" as "COUNTRY OF DESTINATION","Exchange_Rate" as "EXCHANGE_RATE","Imp_Name"	as "BUYER","Imp_Address"	as "BUYER ADDRESS","PortofDestination"	as "PORT_OF_DISCHARGE","Mode"	as "MODE_OF_PORT","PortofOrigin"	as "PORT_OF_LODING","Exp_Name"	as "SHIPPER","Exp_Address"	as "SHIPPER ADDRESS","Exp_City"	as "SHIPPER CITY","Exp_PIN"	as "SHIPPER PIN","Exp_Phone" as "SHIPPER PHONE","Exp_Email"	as "SHIPPER EMAIL","Exp_Contact_Person"	as "SHIPPER CONTACT PERSON", "UnitPriceINR" as "UNIT_INR", "FOB_INR"  FROM'
        :'"RecordID", "Type" as "DIRECTION","Date" as "DATE","Month" as "MONTH","Year" as "YEAR","HsCode" as "TARIFF CODE","HSCode2dig" as "2 DIGIT","HSCode4Dig" as "4 DIGIT","ProductDesc" as "ITEM DESCRIPTION","CommodityDesc" as "COMMODITY DESCRIPITON","uqc" as "UQC","Quantity" as "QTY","Currency" as "CURR","UnitPriceFC" as "UNT PRICE FC","Duty_PCNTG" as "TAX %","ValueInUSD" as "EST VALUE US$","Importer_Value_USD" as "TOTAL VALUE US$","Exchange_Rate" as "EXCHANGE RATE","Exp_Name" as "VENDOR","EXPORTER_ADDRESS" as "VENDOR ADDRESS","CountryofOrigin" as "PARTNER COUNTRY","PortofOrigin" as "PORT OF LOADING","PortofDestination" as "PORT OF DISCHARGE","Mode" as "MODE","Imp_Name" as "BUYER","Importer_Address" as "BUYER ADDRESS","Importer_City" as "BUYER CITY","Importer_PIN" as "BUYER PIN","Importer_Phone" as "BUYER PHONE","Importer_Email" as "BUYER EMAIL","Importer_Contact_Person" as "BUYER CONTACT PERSON","BE_Type" as "BE TYPE","CHA_Name" as "NOTIFY PARTY NAME", "Duty_USD" as "DUTY_USD", "Duty_INR" as "DUTY_INR", "UnitPriceINR" as "UNIT_INR", "Asset_Value_INR" as "ASS_VAL_INR" FROM ',
}

export const searchingCountryColumns = (direction, country) => {
    const columns = {
        export: {
            india: ['"RecordID"', '"Type"', '"Date"', '"HsCode"', '"ProductDesc"', '"Exp_Name"', '"Imp_Name"', '"CountryofDestination"', '"uqc"', '"Mode"', '"Quantity"', '"Currency"', '"UnitPriceFC"', '"InvValueFC"', '"ValueInUSD"', '"Exchange_Rate"', '"PortofDestination"', '"PortofOrigin"', '"SB_NO"'],
            weekly: ['"RecordID"', '"Date"', '"HsCode"', '"Exp_Name"', '"Imp_Name"', '"CountryofDestination"', '"ProductDesc"', '"Quantity"', '"uqc"', '"Mode"', '"Currency"', '"FOB"', '"PortofOrigin"', '"PortofDestination"', '"Item_NO"', '"Invoice_NO"', '"UnitPriceFC"', '"Drawback"', '"port_code"'],
            china: ['"RecordID"', '"TYPE"', '"Date"', '"HsCode"', '"ProductDesc_Native"', '"ProductDesc"', '"Quantity"', '"uqc"', '"UnitPriceFC"', '"Currency"', '"ValueInUSD"', '"Exp_Name_Native"', '"Exp_Name"', '"Imp_Name_Native"', '"Imp_Name"', '"CountryofOrigin"', '"CountryofDestination"', '"PortofOrigin"', '"PortofDestination"'],
            mirror: ['"RecordID"', '"TYPE"', '"Date"', '"HsCode"', '"ProductDesc_Native"', '"ProductDesc"', '"Quantity"', '"uqc"', '"UnitPriceFC"', '"Currency"', '"ValueInUSD"', '"Exp_Name_Native"', '"Exp_Name"', '"Imp_Name_Native"', '"Imp_Name"', '"CountryofDestination"'],
            statistical: ["'RecordID'", "'HsCode'","'ProductDesc'","'Quantity'","'uqc'","'Currency'","'ValueInUSD'", "'CountryofDestination'"],
        },
        import: {
            india: ['"RecordID"', '"Type"', '"Date"', '"HsCode"', '"ProductDesc"', '"Exp_Name"', '"Imp_Name"', '"CountryofOrigin"', '"uqc"', '"Mode"', '"Quantity"', '"Currency"', '"UnitPriceFC"', '"InvValueFC"', '"Duty_USD"', '"Duty_PCNTG"', '"Exchange_Rate"', '"Importer_Value_USD"', '"ValueInUSD"', '"PortofOrigin"', '"PortofDestination"', '"BE_NO"'],
            weekly: ['"RecordID"', '"Date"', '"HsCode"', '"Exp_Name"', '"Imp_Name"', '"CountryofOrigin"', '"ProductDesc"', '"Quantity"', '"uqc"', '"Currency"'],
            china: ['"RecordID"', '"TYPE"', '"Date"', '"HsCode"', '"ProductDesc_Native"', '"ProductDesc"', '"Quantity"', '"uqc"', '"UnitPriceFC"', '"Currency"', '"ValueInUSD"', '"Exp_Name_Native"', '"Exp_Name"', '"Imp_Name_Native"', '"Imp_Name"', '"CountryofOrigin"', '"CountryofDestination"', '"PortofOrigin"', '"PortofDestination"'],
            mirror: ['"RecordID"', '"TYPE"', '"Date"', '"HsCode"', '"ProductDesc_Native"', '"ProductDesc"', '"Quantity"', '"uqc"', '"UnitPriceFC"', '"Currency"', '"ValueInUSD"', '"Exp_Name_Native"', '"Exp_Name"', '"Imp_Name_Native"', '"Imp_Name"', '"CountryofOrigin"'],
            statistical: ["'RecordID'", "'HsCode'","'ProductDesc'","'Quantity'","'uqc'","'Currency'","'ValueInUSD'", "'CountryofOrigin'"],
        }
    };

    return Object.hasOwn(columns[direction], country) ? columns[direction][country]: ["*"];
}


export const fetchSideFilterQuery = (pathName) => {
    const sideFilter = pathName?.replace(/^\/get|Filter$/gi, "");

    switch(sideFilter) {
        case "PortofDestination":
            return sideFiltersQuery?.GET_PORT_OF_DESTINATION_ACCESS;
        case "PortofOrigin":
            return sideFiltersQuery?.GET_PORT_OF_ORIGIN_ACCESS;
        case "Month":
            return sideFiltersQuery?.GET_MONTH_ACCESS;
        case "Year":
            return sideFiltersQuery?.GET_YEAR_ACCESS;
        case "Mode":
            return sideFiltersQuery?.GET_MODE_ACCESS;
        case "uqc":
            return sideFiltersQuery?.GET_UQC_ACCESS;
        case "Currency":
            return sideFiltersQuery?.GET_CURRENCY_ACCESS;
        case "NotifyPartyName":
            return sideFiltersQuery?.GET_NOTIFY_PARTY_ACCESS;
        case "LoadingPort":
            return sideFiltersQuery?.GET_LOADING_PORT_ACCESS;
        default: return null;
    }
};

export const extractCountry = (tableName) => {
    let tablesCountryName = tableName.replace(/^\/?get(.*?)(Imports|Exports)$/i, '$1');
    tablesCountryName = tablesCountryName[0].toUpperCase() + tablesCountryName.slice(1).toLowerCase();

    const country = {
        Afghanistan: "AFGHANISTAN",
        Argentina: "ARGENTINA",
        Algeria: "ALGERIA",
        Angola: "ANGOLA",
        Armenia: "ARMENIA",
        Australia: "AUSTRALIA",
        Austria: "AUSTRIA",
        Azerbaijan: "AZERBAIJAN",
        Bahrain: "BAHRAIN",
        Barbados: "BARBADOS",
        Belarus: "BELARUS",
        Belgium: "BELGIUM",
        Benin: "BENIN",
        Bermuda: "BERMUDA",
        Bhutan: "BHUTAN",
        Brazil: "BRAZIL",
        Bulgaria: "BULGARIA",
        Burundi: "BURUNDI",
        Cambodia: "CAMBODIA",
        Canada: "CANADA",
        Chad: "CHAD",
        China: "CHINA",
        Croatia: "CROATIA",
        Cyprus: "CYPRUS",
        Czechia: "CZECHIA",
        Denmark: "DENMARK",
        Democraticrepubliccongo: "DEMOCRATIC REPUBLIC CONGO",
        Dominicanrepublic: "DOMINICAN REPUBLIC",
        Egypt: "EGYPT",
        Elsalvador: "EL SALVADOR",
        Estonia: "ESTONIA",
        Finland: "FINLAND",
        France: "FRANCE",
        Gabon: "GABON",
        Georgia: "GEORGIA",
        Germany: "GERMANY",
        Greece: "GREECE",
        Guatemala: "GUATEMALA",
        Guinea: "GUINEA",
        Honduras: "HONDURAS",
        Hongkong: "HONG KONG",
        Hungary: "HUNGARY",
        Iran: "IRAN",
        Ethiopia: "ETHIOPIA",
        Iraq: "IRAQ",
        Ireland: "IRELAND",
        Israel: "ISRAEL",
        Italy: "ITALY",
        Jamaica: "JAMAICA",
        Japan: "JAPAN",
        Jordan: "JORDAN",
        Kenya: "KENYA",
        Kuwait: "KUWAIT",
        Kyrgyzstan: "KYRGYZSTAN",
        Latvia: "LATVIA",
        Lithuania: "LITHUANIA",
        Luxembourg: "LUXEMBOURG",
        Libya: "LIBYA",
        Maldives: "MALDIVES",
        Mauritius: "MAURITIUS",
        Moldova: "MOLDOVA",
        Morocco: "MOROCCO",
        Mozambique: "MOZAMBIQUE",
        Nepal: "NEPAL",
        Netherlands: "NETHERLANDS",
        Newzealand: "NEW ZEALAND",
        Niger: "NIGER",
        Nigeria: "NIGERIA",
        Norway: "NORWAY",
        Oman: "OMAN",
        Palestine: "PALESTINE",
        Papuanewguinea: "PAPUA NEW GUINEA",
        Poland: "POLAND",
        Portugal: "PORTUGAL",
        Qatar: "QATAR",
        Romania: "ROMANIA",
        Saudiarabia: "SAUDI ARABIA",
        Senegal: "SENEGAL",
        Serbia: "SERBIA",
        Seychelles: "SEYCHELLES",
        Slovakia: "SLOVAKIA",
        Slovenia: "SLOVENIA",
        Singapore: "SINGAPORE",
        Somalia: "SOMALIA",
        Southafrica: "SOUTHA FRICA",
        Southkorea: "SOUTH KOREA",
        Spain: "SPAIN",
        Sweden: "SWEDEN",
        Switzerland: "SWITZERLAND",
        Taiwan: "TAIWAN",
        Tajikistan: "TAJIKISTAN",
        Thailand: "THAILAND",
        Togo: "TOGO",
        Trinidadandtobago: "TRINIDAD AND TOBAGO",
        Tunisia: "TUNISIA",
        Turkmenistan: "TURKMENISTAN",
        Unitedarabemirates: "UNITED ARAB EMIRATES",
        Unitedkingdom: "UNITED KINGDOM",
        Unitedstatesofamerica: "UNITED STATES OF AMERICA",
        Yemen: "YEMEN",
        Sudan: "SUDAN",
        Syria: "SYRIA",
    };

    return country[tablesCountryName];
};

export const countryMappingViaType = {
    bolivia: {isCustom: true},
    brazil: {isCustom: true},
    mexico: {isCustom: true},
    nicaragua: {isCustom: true},
    turkey: {isCustom: true},
    usa: {isCustom: true},
    australia: {isCustom: false, mirrorCountryName: "AUSTRALIA"},
    canada: {isCustom: false, mirrorCountryName: "CANADA"},
    dominicanrepublic: {isCustom: false, mirrorCountryName: "DOMINICAN REPUBLIC"},
    egypt: {isCustom: false, mirrorCountryName: "EGYPT"},
    elsalvador: {isCustom: false, mirrorCountryName: "EL SALVADOR"},
    guatemala: {isCustom: false, mirrorCountryName: "GUATEMALA"},
    honduras: {isCustom: false, mirrorCountryName: "HONDURAS"},
    israel: {isCustom: false, mirrorCountryName: "ISRAEL"},
    japan: {isCustom: false, mirrorCountryName: "JAPAN"},
    newzealand: {isCustom: false, mirrorCountryName: "NEW ZEALAND"},
    puertorico: {isCustom: false, mirrorCountryName: "PUERTO RICO"},
    spain: {isCustom: false, mirrorCountryName: "SPAIN"},
    taiwan: {isCustom: false, mirrorCountryName: "TAIWAN"},
    thailand: {isCustom: false, mirrorCountryName: "THAILAND"},
    unitedkingdom: {isCustom: false, mirrorCountryName: "UNITED KINGDOM"},
    unitedkingdom: {isCustom: false, mirrorCountryName: "UNITED KINGDOM"},
};


export const userValitionError = {
    FullName: body("FullName").notEmpty().withMessage("Full name is required."),
    CompanyName: body("CompanyName").notEmpty().withMessage("Company name is required."),
    MobileNumber: body("MobileNumber").notEmpty().isLength({min: 10}).withMessage("Mobile number must be in 10 digit"),
    Password: body("Password").notEmpty().isLength({min: 5}).withMessage("Password must be at least 5 chars"),
    Email: body("Email").notEmpty().isEmail().withMessage("Email is required."),
    country: body("country").notEmpty().withMessage("Country is required." ),
    ParentUserId: body("ParentUserId").notEmpty().withMessage("ParentUserId is required."),
    RoleId: body("RoleId").notEmpty().withMessage("RoleId is required." ),
    CurrentPassword: body("CurrentPassword").notEmpty().isLength({min: 5}).withMessage("Current password is required." ),
    NewPassword: body("NewPassword").notEmpty().isLength({min: 5}).withMessage("New password is required." ),
    UserId: body("UserId").notEmpty().withMessage("UserId is required." ),
    Designation: body("Designation").notEmpty().withMessage("Designation is required." ),
    Location: body("Location").notEmpty().withMessage("Location is required." ),
    GST: body("GST").notEmpty().withMessage("GST is required." ),
    IEC: body("IEC").notEmpty().withMessage("IEC is required." ),
    PlanId: body("PlanId").notEmpty().withMessage("PlanId is required." ),
    Downloads: body("Downloads").notEmpty().withMessage("Downloads is required." ),
    Searches: body("Searches").notEmpty().withMessage("Searches is required." ),
    StartDate: body("StartDate").notEmpty().withMessage("StartDate is required." ),
    EndDate: body("EndDate").notEmpty().withMessage("EndDate is required." ),
    Validity: body("Validity").notEmpty().withMessage("Validity is required." ),
    DataAccess: body("DataAccess").notEmpty().withMessage("DataAccess is required." ),
    CountryAccess: body("CountryAccess").notEmpty().withMessage("CountryAccess is required." ),
    CommodityAccess: body("CommodityAccess").notEmpty().withMessage("CommodityAccess is required." ),
    TarrifCodeAccess: body("TarrifCodeAccess").notEmpty().withMessage("TarrifCodeAccess is required." ),
    Workspace: body("Workspace").notEmpty().withMessage("Workspace is required." ),
    WSSLimit: body("WSSLimit").notEmpty().withMessage("WSSLimit is required." ),
    Downloadfacility: body("Downloadfacility").notEmpty().withMessage("Downloadfacility is required." ),
    Favoriteshipment: body("Favoriteshipment").notEmpty().withMessage("Favoriteshipment is required." ),
    Whatstrending: body("Whatstrending").notEmpty().withMessage("Whatstrending is required." ),
    Companyprofile: body("Companyprofile").notEmpty().withMessage("Companyprofile is required." ),
    Addonfacility: body("Addonfacility").notEmpty().withMessage("Addonfacility is required." ),
    Analysis: body("Analysis").notEmpty().withMessage("Analysis is required." ),
    User: body("User").notEmpty().withMessage("User is required." ),
    AddUser: body("AddUser").notEmpty().withMessage("AddUser is required." ),
    EditUser: body("EditUser").notEmpty().withMessage("EditUser is required." ),
    DeleteUser: body("DeleteUser").notEmpty().withMessage("DeleteUser is required." ),
    AddPlan: body("AddPlan").notEmpty().withMessage("AddPlan is required." ),
    EditPlan: body("EditPlan").notEmpty().withMessage("EditPlan is required." ),
    DeletePlan: body("DeletePlan").notEmpty().withMessage("DeletePlan is required." ),
    DownloadsAccess: body("DownloadsAccess").notEmpty().withMessage("DownloadsAccess is required." ),
    Search: body("Search").notEmpty().withMessage("Search is required." ),
    EnableId: body("EnableId").notEmpty().withMessage("EnableId is required." ),
    DisableId: body("DisableId").notEmpty().withMessage("DisableId is required." ),
    BlockUser: body("BlockUser").notEmpty().withMessage("BlockUser is required." ),
    UnblockUser: body("UnblockUser").notEmpty().withMessage("UnblockUser is required." ),
    ClientList: body("ClientList").notEmpty().withMessage("ClientList is required." ),
    PlanList: body("PlanList").notEmpty().withMessage("PlanList is required." ),
    Share: body("Share").notEmpty().withMessage("Share is required."),
};

export const planValitionError = {
    PlanName: body("PlanName").notEmpty().withMessage("PlanName is required."),
    Amount: body("Amount").notEmpty().withMessage("Amount is required."),
    Validity: body("Validity").notEmpty().withMessage("Validity is required."),
    DataAccess: body("DataAccess").notEmpty().withMessage("DataAccess is required."),
    Downloads: body("Downloads").notEmpty().withMessage("Downloads is required."),
    Searches: body("Searches").notEmpty().withMessage("Searches is required."),
    CountryAccess: body("CountryAccess").notEmpty().withMessage("CountryAccess is required."),
    CommodityAccess: body("CommodityAccess").notEmpty().withMessage("CommodityAccess is required."),
    TarrifCodeAccess: body("TarrifCodeAccess").notEmpty().withMessage("TarrifCodeAccess is required."),
    Workspace: body("Workspace").notEmpty().withMessage("Workspace is required."),
    WSSLimit: body("WSSLimit").notEmpty().withMessage("WSSLimit is required."),
    Downloadfacility: body("Downloadfacility").notEmpty().withMessage("Downloadfacility is required."),
    Favoriteshipment: body("Favoriteshipment").notEmpty().withMessage("Favoriteshipment is required."),
    Whatstrending: body("Whatstrending").notEmpty().withMessage("Whatstrending is required."),
    Companyprofile: body("Companyprofile").notEmpty().withMessage("Companyprofile is required."),
    Contactdetails: body("Contactdetails").notEmpty().withMessage("Contactdetails is required."),
    Addonfacility: body("Addonfacility").notEmpty().withMessage("Addonfacility is required."),
    Analysis: body("Analysis").notEmpty().withMessage("Analysis is required."),
    User: body("User").notEmpty().withMessage("User is required.")
};
