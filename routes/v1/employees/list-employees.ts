import { Request, Response } from 'express';
import { map } from 'lodash';
import { toEntity } from '../../../database/utils';
import { Employee } from '../../../models/employee';
import db, { TableName } from '../../../database';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Role } from '../../../models/role';

export default async (req: Request, res: Response) => {
    try {
        const employees = await getEmployees();

        res.status(200).json({
            data: map(employees, (employee) => toEntity(Employee, employee))
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function getEmployees () {
    const { rows } = await db.query(`
        SELECT
            e.id AS "e__id",
            e.reference AS "e__reference",
            e.first_name AS "e__first_name",
            e.first_last_name AS "e__first_last_name",
            e.hourly_rate AS "e__hourly_rate",
            e.role_id AS "e__role_id",
            e.created_at AS "e__created_at",
            e.updated_at AS "e__updated_at",
            e.deleted_at AS "e__deleted_at",
            r.id AS "r__id",
            r.code AS "r__code"
        FROM ${TableName.EMPLOYEES} e
        LEFT JOIN ${TableName.ROLES} r ON (r.id = e.role_id AND r.deleted_at IS NULL)
        WHERE e.deleted_at IS NULL
    `);

    return map(rows, (row) => {
        const employee = toEntity(Employee, row, 'e');
        employee.role = toEntity(Role, row, 'r');

        return employee;
    });
}
