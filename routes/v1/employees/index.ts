import { Router } from 'express';
import createEmployee from './create-employee';
import listEmployees from './list-employees';

const router = Router();

router.get('/', listEmployees)
router.post('/create', createEmployee);

export default router;
