import { authController } from "./auth/authcontroller.js";
import { indiaController } from "./auth/indiaController.js";
import { chinaController } from "./auth/chinaController.js";
import { customController } from "./auth/customController.js";
import { mirrorController } from "./auth/mirrorController.js";
import { weeklyController } from "./auth/weeklyController.js";
import { generalController } from "./auth/generalController.js";
import { workspaceController } from "./auth/workspaceController.js"
import { downloadingController } from "./auth/downloadController.js";
import { sideFilterController } from "./auth/sideFilterController.js";
import { companyProfileController } from "./auth/companyController.js";
import { statisticalController } from "./auth/statisticalController.js";
import { whatsTrandingControllers } from "./auth/whatstrandingController.js";
import { analysisController, getRecordCountController } from "./auth/analysisController.js";

import { planAdminController } from "./auth/adminController/plan.js";
import { userAdminController } from "./auth/adminController/users.js";
import { OthersAdminControllers } from "./auth/adminController/others.js";
import { countryAdminController } from "./auth/adminController/country.js";

export default {
    authController,
    indiaController,
    chinaController,
    customController,
    mirrorController,
    weeklyController,
    generalController,
    analysisController,
    workspaceController,
    sideFilterController,
    downloadingController,
    statisticalController,
    companyProfileController,
    whatsTrandingControllers,
    getRecordCountController,
    planAdminController,
    userAdminController,
    countryAdminController,
    OthersAdminControllers
};
