import { Router } from 'express';
import listEmployees from './list-employees';

const router = Router();

router.get('/', listEmployees)

export default router;
