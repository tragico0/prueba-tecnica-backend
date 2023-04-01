import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { isFinite, toNumber } from "lodash";
import db, { TableName } from "../../../database";
import { toEntity } from "../../../database/utils";
import { Employee } from "../../../models/employee";
import { Role } from "../../../models/role";

export default async (req: Request, res: Response) => {
    const id = toNumber(req.params?.id);
    if (!isFinite(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        });
    }

    try {
        const employee = await getEmployeeById(id);

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

async function getEmployeeById (id: number) {
    const { rows: [result] } = await db.query(`
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
        LEFT JOIN ${TableName.ROLES} r ON r.id = e.role_id AND r.deleted_at IS NULL
        WHERE e.deleted_at IS NULL
            AND e.id = $1
    `, [
        id
    ]);

    const employee = toEntity(Employee, result, 'e');
    employee.role = toEntity(Role, result, 'r');

    return employee;
}
