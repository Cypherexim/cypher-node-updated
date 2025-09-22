import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";

const router = express.Router();
const { whatsTrandingControllers } = controllers;

router.use(jwtMiddleHandler);

router.get("/getWhatstrendingGraphData", whatsTrandingControllers?.getWhatstrandingAnalysis);
router.get("/getWhatstrendingTotalVal", whatsTrandingControllers?.getWhatstrandingTotalValues);
router.get("/getWhatstrendingCommodity", whatsTrandingControllers?.getWhatsTrendingCommodity);
router.get('/getwhatstrending', whatsTrandingControllers?.getWhatsTrending);
router.get("/getWhatsTrandingMap", whatsTrandingControllers?.getWhatsTrandingMap);
router.get("/getlatestcountrybyvalue", whatsTrandingControllers?.topcountriesByValue);

export default router;
