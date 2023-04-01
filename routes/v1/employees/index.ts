import { Router } from 'express';
import addEmployeeDeliveries from './add-employee-deliveries';
import createEmployee from './create-employee';
import editEmployee from './edit-employee';
import getEmployeeById from './get-employee-by-id';
import listEmployees from './list-employees';

const router = Router();

router.get('/', listEmployees);
router.get('/:id', getEmployeeById);
router.post('/:id/edit', editEmployee);
router.post('/create', createEmployee);
router.post('/add-deliveries', addEmployeeDeliveries);

export default router;
