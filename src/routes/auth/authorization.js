import { Router } from 'express';

import controllers from '../../controllers/index.js';
import { userValidation } from "../../middlewares/userValidation.js";

const router = Router();

const { authController } = controllers;

router.get('/getErrorLogs/:date', authController?.getErrorLogs);
router.post('/signin', userValidation, authController?.postLogin);
router.post('/signup', userValidation, authController?.createUser);
router.post('/changePassword', userValidation, authController?.changePassword);

export default router;
