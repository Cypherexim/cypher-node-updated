import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";

const { generalController } = controllers;

const router = express.Router();

router.use(jwtMiddleHandler);

router.post('/getcount', controllers?.getRecordCountController);
router.post('/getAnalysisReport', controllers?.analysisController);
router.post('/generatedownloadfiles', controllers?.downloadingController);
router.get('/getAllSideFilterAccess', generalController?.getAllSideFilterAccess);

export default router;
