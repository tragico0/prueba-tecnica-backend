import { Router } from 'express';
import addEmployeeDeliveries from './add-employee-deliveries';
import createEmployee from './create-employee';
import listEmployees from './list-employees';

const router = Router();

router.get('/', listEmployees)
router.post('/create', createEmployee);
router.post('/add-deliveries', addEmployeeDeliveries);

export default router;
