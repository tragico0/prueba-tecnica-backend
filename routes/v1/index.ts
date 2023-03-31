import { Router } from "express";
import employeesRoutes from './employees';

const router = Router();

router.get('/', (req, res) => {
    return res.status(403).send();
});

router.use('/employees', employeesRoutes);


export default router;
