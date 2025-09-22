import express from 'express';

import controllers from "../../controllers/index.js";

const router = express.Router();
const { companyProfileController } = controllers;

router.get("/getFeedbacks", companyProfileController?.getFeedbacks);
router.post("/addNewFeedback", companyProfileController?.addNewFeedback);
router.get("/getTop5Companies", companyProfileController?.getTopFiveCompanies);
router.get("/getTop10Companies", companyProfileController?.getTopTenCompanies);
router.post('/getCompanyprofile', companyProfileController?.getcompanyprofile);
router.post("/getBuyersList", companyProfileController.getLocatorCompaniesList);
router.post("/setNewCompanyData", companyProfileController?.setNewCompanyDetails);
router.post("/getSuppliersList", companyProfileController.getLocatorCompaniesList);
router.post("/getCompanyInfoData", companyProfileController?.getCompanyInfoDetails);
router.post("/getFavoriteCompanies", companyProfileController?.getFavoriteCompanies);
router.post("/getLinkedInCompanies", companyProfileController?.getLinkedInCompanies);
router.post("/getLinkedInEmployees", companyProfileController?.getLinkedInEmployees);
router.get("/getRequestedCompanies", companyProfileController?.getRequestedCompanies);
router.get("/getCommodityCountList", companyProfileController?.getCommodityCountList);
router.get("/getCompanyListBykeword", companyProfileController?.getCompanyListBykeword);
router.post("/transferForCompanyData", companyProfileController?.transferCompanyDetails);

export default router;
