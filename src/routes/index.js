import express from "express";

import adminRoutes from "./auth/admin.js";
import customRoutes from "./auth/custom.js";
import mirrorRoutes from "./auth/mirror.js";
import commonRoutes from "./auth/common.js";
import generalRoutes from "./auth/general.js";
import authRoutes from "./auth/authorization.js";
import workspaceRoutes from "./auth/workspace.js";
import sideFilterRoutes from "./auth/sideFilter.js";
import companyProfileRoutes from "./auth/company.js";
import statisticalRoutes from "./auth/statistical.js";
import whatstrandingRoutes from "./auth/whatstranding.js";

const routers = express.Router();

routers.use("/", [
    authRoutes,
    adminRoutes,
    commonRoutes, 
    generalRoutes, 
    workspaceRoutes,
    sideFilterRoutes, 
    whatstrandingRoutes, 
    companyProfileRoutes
]);
routers.use("/CUSTOM", customRoutes);
routers.use("/MIRROR", mirrorRoutes);
routers.use("/STATISTICAL", statisticalRoutes);

export default routers;
