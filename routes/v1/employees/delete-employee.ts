import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { isFinite, toNumber } from "lodash";
import db, { TableName } from "../../../database";

export default async (req: Request, res: Response) => {
    const id = toNumber(req.params?.id);
    if (!isFinite(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        });
    }

    try {
        const success = await deleteEmployeeById(id);

        res.status(200).json({
            data: success
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function deleteEmployeeById (id: number) {
    await db.query(`
        UPDATE ${TableName.PAYROLL_COVER} SET
            updated_at = CURRENT_TIMESTAMP,
            deleted_at = CURRENT_TIMESTAMP
        WHERE employee_id = $1
    `, [id]);


    await db.query(`
        UPDATE ${TableName.EMPLOYEES} SET
            updated_at = CURRENT_TIMESTAMP,
            deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `, [id]);

    return true;
}
