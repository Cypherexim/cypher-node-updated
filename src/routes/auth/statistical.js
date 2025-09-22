import express from "express";

import controllers from "../../controllers/index.js";
import { jwtMiddleHandler } from "../../middlewares/jwt.js";
import { countryBodyValidator } from "../../middlewares/countryValidator.js";

const router = express.Router();
const { statisticalController } = controllers;

router.use([jwtMiddleHandler, countryBodyValidator]);

/////export APIs
router.post("/getBoliviaExports", statisticalController?.export);
router.post("/getBrazilExports", statisticalController?.export);
router.post("/getMexicoExports", statisticalController?.export);
router.post("/getNicaraguaExports", statisticalController?.export);
router.post("/getTurkeyExports", statisticalController?.export);
router.post("/getUsaExports", statisticalController?.export);
router.post("/getAustraliaExports", statisticalController?.export);
router.post("/getCanadaExports", statisticalController?.export);
router.post("/getDominicanrepublicExports", statisticalController?.export);
router.post("/getEgyptExports", statisticalController?.export);
router.post("/getElsalvadorExports", statisticalController?.export);
router.post("/getGuatemalaExports", statisticalController?.export);
router.post("/getHondurasExports", statisticalController?.export);
router.post("/getIsraelExports", statisticalController?.export);
router.post("/getJapanExports", statisticalController?.export);
router.post("/getNewzealandExports", statisticalController?.export);
router.post("/getPuertoricoExports", statisticalController?.export);
router.post("/getSpainExports", statisticalController?.export);
router.post("/getTaiwanExports", statisticalController?.export);
router.post("/getThailandExports", statisticalController?.export);
router.post("/getUnitedkingdomExports", statisticalController?.export);


/////import APIs
router.post("/getBoliviaImports", statisticalController?.import);
router.post("/getBrazilImports", statisticalController?.import);
router.post("/getMexicoImports", statisticalController?.import);
router.post("/getNicaraguaImports", statisticalController?.import);
router.post("/getTurkeyImports", statisticalController?.import);
router.post("/getUsaImports", statisticalController?.import);
router.post("/getAustraliaImports", statisticalController?.import);
router.post("/getCanadaImports", statisticalController?.import);
router.post("/getDominicanrepublicImports", statisticalController?.import);
router.post("/getEgyptImports", statisticalController?.import);
router.post("/getElsalvadorImports", statisticalController?.import);
router.post("/getGuatemalaImports", statisticalController?.import);
router.post("/getHondurasImports", statisticalController?.import);
router.post("/getIsraelImports", statisticalController?.import);
router.post("/getJapanImports", statisticalController?.import);
router.post("/getNewzealandImports", statisticalController?.import);
router.post("/getPuertoricoImports", statisticalController?.import);
router.post("/getSpainImports", statisticalController?.import);
router.post("/getTaiwanImports", statisticalController?.import);
router.post("/getThailandImports", statisticalController?.import);
router.post("/getUnitedkingdomImports", statisticalController?.import);

export default router;
