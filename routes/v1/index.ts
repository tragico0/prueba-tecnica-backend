import { Router } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

const router = Router();

router.get('/', (req, res) => {
    res.status(StatusCodes.NOT_IMPLEMENTED).json({
        message: ReasonPhrases.NOT_IMPLEMENTED
    });
});

export default router;
