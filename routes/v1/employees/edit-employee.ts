import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { isEmpty, isFinite, toNumber } from "lodash";
import internal from "stream";
import db from '../../../database';
import { toEntity } from "../../../database/utils";
import { Employee } from "../../../models/employee";

interface EditEmployeeData {
    id: number,
    reference: string;
    firstName: string;
    firstLastName: string;
    hourlyRate: number;
    roleId: number;
}

export default async (req: Request, res: Response) => {
    const id = toNumber(req.params?.id);
    if (!isFinite(id) || isEmpty(req.body?.data)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        });
    }

    try {
        const data = {id, ...req.body.data};
        const employee = await editEmployee(data);

        res.status(200).json({
            data: toEntity(Employee, employee)
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function editEmployee (data: EditEmployeeData) {
    const { rows: [result] } = await db.query(`
        SELECT * from edit_employee($1, $2, $3, $4, $5, $6);
    `, [
        data.id,
        data.reference,
        data.firstName,
        data.firstLastName ?? '',
        data.hourlyRate ?? 30,
        data.roleId
    ]);

    return toEntity(Employee, result);
}
