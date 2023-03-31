import { Router } from "express";
import listRoles from './list-roles';

const router = Router();

router.use('/', listRoles);

export default router;
