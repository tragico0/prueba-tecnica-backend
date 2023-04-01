import { Router } from 'express';
import addEmployeeDeliveries from './add-employee-deliveries';
import createEmployee from './create-employee';
import listEmployees from './list-employees';
import getEmployeeById from './get-employee-by-id';

const router = Router();

router.get('/', listEmployees);
router.get('/:id', getEmployeeById);
router.post('/create', createEmployee);
router.post('/add-deliveries', addEmployeeDeliveries);

export default router;
