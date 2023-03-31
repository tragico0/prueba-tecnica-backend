import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { isEmpty } from "lodash";
import db from '../../../database';
import { toEntity } from "../../../database/utils";
import { Employee } from "../../../models/employee";

interface CreateEmployeeData {
    reference: string;
    firstName: string;
    firstLastName: string;
    hourlyRate: number;
    roleId: number;
}

export default async (req: Request, res: Response) => {
    if (isEmpty(req.body?.data)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        });
    }

    try {
        const employee = await createEmployee(req.body.data);

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

async function createEmployee (data: CreateEmployeeData) {
    const { rows: [result] } = await db.query(`
        SELECT * from create_employee($1, $2, $3, $4, $5);
    `, [
        data.reference,
        data.firstName,
        data.firstLastName ?? '',
        data.hourlyRate ?? 30,
        data.roleId
    ]);

    return toEntity(Employee, result);
}
