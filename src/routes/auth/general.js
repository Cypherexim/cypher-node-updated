import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";

const router = express.Router();
const { generalController } = controllers;

router.use(jwtMiddleHandler);

router.get('/getSideFilterAccess', generalController?.getSideFilterAccess);
router.post('/addUpdateAccess', generalController?.addupdateAccessSideFilter);
router.get('/getcommonimport', generalController?.getcommonimportlist);
router.get('/getcommonexport', generalController?.getcommonexportlist);
router.get('/getlatestdate', generalController?.getlatestDate);
router.get('/gethscode', generalController?.getHscode);
router.get('/getcountries',generalController?.getallcountries);
router.post('/adduseractivitylog', generalController?.adduserActivitylog);
router.get('/getAccountDetails', generalController?.getAccountDetails);
router.get('/getProductDesc', generalController?.getProductDesc);
router.get('/getAllRoles', generalController?.getRoleList);
router.get('/getRolesAccessById', generalController?.getAccessByRoleId);
router.get("/updateFavoriteShipment", generalController?.updateFavoriteShipment); //changed response
router.get("/updateCompanyPoints", generalController?.updateCompanyPoints); //changed response

export default router;
