import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";

const router = express.Router();
const { workspaceController } = controllers;

router.use(jwtMiddleHandler);

router.get('/getWorkSpace', workspaceController?.getWorkspace);
router.post('/addWorkspace', workspaceController?.addWorkspace);
router.post('/updateworkspace', workspaceController?.updateWorkspace);
router.get('/deleteWorkspace', workspaceController?.deleteWorkspace);
router.post('/savedownloadworkspace', workspaceController?.saveDownload);
router.post('/getdownloadData', workspaceController?.getdownloaddata);
router.post('/sharedownloadtransaction', workspaceController?.sharedownloadfile);
router.post('/sendDownloadingMail', workspaceController?.sendDownloadingLinkMail);
router.get('/getDownloadCost', workspaceController?.getDownloadCost);
router.get('/getdownloadworkspace', workspaceController?.getDownloadworkspace);

export default router;
