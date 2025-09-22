import express from 'express';

import controllers  from '../../controllers/index.js';
import { jwtMiddleHandler } from '../../middlewares/jwt.js';
import { planValidation } from '../../middlewares/planValidation.js';
import { userValidation } from '../../middlewares/userValidation.js';

const router = express.Router();
const { planAdminController, countryAdminController, userAdminController, OthersAdminControllers } = controllers;

// router.use(jwtMiddleHandler);

//------------PLAN ROUTES-------------------//
router.post('/addplan', planValidation, planAdminController?.createPlan);
router.get('/getallplans', planAdminController?.getPlanList);

//------------USER ROUTES-------------------//
router.post('/addUserAdmin', userValidation, userAdminController?.addUserByAdmin);
router.post('/resetpassword', userValidation, userAdminController?.resetPassword);
router.get('/getAllUserList', userAdminController?.getAllUserlist);
router.post('/updateUserAdmin', userValidation, userAdminController?.updateUserByAdmin);
router.post('/enabledisableuser', userAdminController?.enabledisableuser);
router.get("/getUserPreferences", userAdminController?.getLatestUserPref);
router.get('/getForgotUserDetail',userAdminController?.getUserDetailsByEmail);
router.post('/updateuserpreferences', userAdminController?.updateUserPreference);
router.get('/getUserslistByParentId', userAdminController?.getuserlistbyParentId);
router.post("/updateForgotUserPassword", userAdminController?.updateUserPassword);

//------------COUNTRY ROUTES-------------------//
router.post('/addCountry', countryAdminController?.addCountry);
router.get('/getContries', countryAdminController?.getCountries);
router.get('/getlatestdate', countryAdminController?.getlatestDate);
router.post('/updateCountry', countryAdminController?.updateCountry);
router.get('/getAllCountryCodes',countryAdminController?.getAllCountrycodes);
router.post('/addimporteddatahistory', countryAdminController?.addDataHistory);
router.get('/getAllContries', countryAdminController?.getCountrieswithoutdate);
router.get('/getAllGlobeCountries',countryAdminController?.getAllGlobeCountries);
router.get('/getAllCountriesDates',countryAdminController?.getAllCountriesDates);
router.get('/getGlobalCountriesList',countryAdminController?.getGlobalCountriesList);

//------------OTHERS ROUTES-------------------//
router.post('/addlog',OthersAdminControllers?.adduserlog);
router.get('/getlogs', OthersAdminControllers?.getUserlogs);
router.get('/getalertmessage',OthersAdminControllers?.getAlertMessage);
router.get('/getnotification', OthersAdminControllers?.getnotification);
router.post('/addnotification', OthersAdminControllers?.addnotification);
router.post('/adduseractionlog', OthersAdminControllers?.adduseractionlog);
router.get('/getuseractionlogs', OthersAdminControllers?.getUserActionlogs);
router.post('/updatealertmessage',OthersAdminControllers?.updateAlertMessage);
router.post('/adduseractivitylog', OthersAdminControllers?.adduserActivitylog);
router.get('/getuseractivitylist', OthersAdminControllers?.getUserActivitylogs);

export default router;
