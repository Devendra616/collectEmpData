import express from 'express';

const router = express.Router();

import handlers from '../controller/empRegLogin.js';
import validateReg from '../middleware/validateRegistration.js';
import personalDetailsHandler from '../controller/personalDetails.js';
import { verifyToken } from '../middleware/authenticateLogin.js';
import fetchController from '../controller/fetchDetails.js'
import educationDetailsHandler from '../controller/educationDetails.js';
const {fetchPersonalDetails } = fetchController;

const  {registrationHandler, loginHandler} = handlers;

// router.get('/welcome', (req, res) => {
//   res.status(200).json({ message: 'Welcome! Your route is working.' });
// });

router.post('/register',validateReg, registrationHandler);

router.post('/login', loginHandler)

router.post('/personal',verifyToken, personalDetailsHandler)

router.post('/education', verifyToken, educationDetailsHandler)

router.get('/personalDetails',verifyToken, fetchPersonalDetails)

export default router;
