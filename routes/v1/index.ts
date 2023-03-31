import { Router } from "express";
import employeesRoutes from './employees';
import rolesRoutes from './roles';

const router = Router();

router.get('/', (req, res) => {
    return res.status(403).send();
});

router.use('/employees', employeesRoutes);
router.use('/roles', rolesRoutes);


export default router;
