import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";

const router = express?.Router();
const { sideFilterController } = controllers;

router.use(jwtMiddleHandler);

router.post("/getHsCodeFilter", sideFilterController?.hsCode);
router.post("/getImp_NameFilter", sideFilterController?.company);
router.post("/getExp_NameFilter", sideFilterController?.company);
router.post("/getCountryFilter", sideFilterController?.country);
router.post("/getPortofOriginFilter", sideFilterController?.common);
router.post("/getPortofDestinationFilter", sideFilterController?.common);
router.post("/getModeFilter", sideFilterController?.common);
router.post("/getCurrencyFilter", sideFilterController?.common);
router.post("/getuqcFilter", sideFilterController?.common);
router.post("/getMonthFilter", sideFilterController?.common);
router.post("/getYearFilter", sideFilterController?.common);
router.post("/getLoadingPortFilter", sideFilterController?.common);
router.post("/getNotifyPartyNameFilter", sideFilterController?.common);

export default router;
