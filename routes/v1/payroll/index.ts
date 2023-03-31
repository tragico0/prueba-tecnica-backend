import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import getMonthlyPayroll from './get-monthly-payroll';

const router = Router();

router.get('/', (req, res) => {
    return res.status(StatusCodes.FORBIDDEN).send('');
});

router.get('/monthly', getMonthlyPayroll);

export default router;
