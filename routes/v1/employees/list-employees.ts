import { Request, Response } from 'express';
import { map } from 'lodash';
import { toEntity } from '../../../database/utils';
import { Employee } from '../../../models/employee';
import db, { TableName } from '../../../database';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export default async (req: Request, res: Response) => {
    try {
        const employees = await getEmployees();

        res.status(200).json({
            data: map(employees, (employee) => toEntity(Employee, employee))
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function getEmployees () {
    const { rows } = await db.query(`
        SELECT * FROM ${TableName.EMPLOYEES}
    `);

    return rows;
}
