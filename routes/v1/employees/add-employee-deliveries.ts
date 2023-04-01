import BPromise from 'bluebird';
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { head, isEmpty, isNil, map, reduce } from "lodash";
import moment from 'moment-timezone';
import Config from '../../../config';
import db, { TableName } from '../../../database';
import { toEntity } from "../../../database/utils";
import { Employee } from "../../../models/employee";
import { PayrollCover } from "../../../models/payroll-cover";

export default async (req: Request, res: Response) => {
    if (isEmpty(req.body?.data)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: ReasonPhrases.BAD_REQUEST
        });
    }

    const {
        employeeReference,
        employeeName,
        employeeRole,
        selectedMonth,
        deliveriesQuantity
    } = req.body.data;

    try {
        const monthIndex = (selectedMonth - 1);
        const targetMonth = moment.utc().tz(Config.defaultTimezone).month(monthIndex);
        const currentMonth = moment.utc().tz(Config.defaultTimezone);
        const isCurrentMonth = targetMonth.isSame(currentMonth, 'month');
        if (!isCurrentMonth) {
            return res.status(400).json({
                message: 'Is not possible to add deliveries to past/future months'
            });
        }

        const startOfMonth = targetMonth.clone().startOf('month').toISOString();
        const endOfMonth = targetMonth.clone().endOf('month').toISOString();
        let employees: Employee[] = [];
        
        if (!isEmpty(employeeReference)) {
            const result = await findEmployeeByReference(employeeReference);
            employees = isNil(result) ? [] : [result];
        } else if (!isEmpty(employeeName)) {
            const result = await findEmployeeByName(employeeName);
            employees = isNil(result) ? [] : [result];
        } else if (!isEmpty(employeeRole)) {
            employees = await findEmployeesByRoleCode(employeeRole);
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: ReasonPhrases.BAD_REQUEST
            });
        }

        const payrollCovers = await BPromise.mapSeries(employees, async (employee) => {
            const [payrollCover] = await findOrCreatePayrollCoverByEmployeeId(employee, startOfMonth, endOfMonth, deliveriesQuantity);
            return payrollCover;
        });

        await addDeliveriesToPayrollCover(
            map(payrollCovers, (payrollCover) => payrollCover.id),
            deliveriesQuantity
        );

        return res.status(200).json({
            data: true
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function findOrCreatePayrollCoverByEmployeeId (
    employee: Employee,
    startOfMonth: string,
    endOfMonth: string,
    deliveriesQuantity: number
): Promise<[PayrollCover, boolean]> {
    let { rows: [payrollCover] } = await db.query(`
        SELECT * FROM ${TableName.PAYROLL_COVER}
        WHERE employee_id = $1
            AND created_at BETWEEN $2 AND $3;
    `, [
        employee.id, startOfMonth, endOfMonth
    ]);

    if (isNil(payrollCover)) {
        const result = await db.query(`
            SELECT * FROM create_payroll_cover($1, $2, $3, $4, $5);
        `, [
            employee.id, employee.hourlyRate, 0, deliveriesQuantity, null
        ]);

        return [toEntity(PayrollCover, head(result.rows)), true];
    }

    return [toEntity(PayrollCover, payrollCover), false];
}

async function findEmployeeByReference (employeeReference: string) {
    const { rows: [employee] } = await db.query(`
        SELECT * FROM ${TableName.EMPLOYEES}
        WHERE reference = $1
    `, [employeeReference])

    return toEntity(Employee, employee);
}

async function findEmployeeByName (employeeName: string) {
    const { rows: [employee] } = await db.query(`
        SELECT e.*
        FROM ${TableName.EMPLOYEES} e
        WHERE CONCAT(e.first_name, e.first_last_name) = $1
    `, [employeeName]);

    return toEntity(Employee, employee);
}

async function findEmployeesByRoleCode (roleCode: string) {
    const { rows } = await db.query(`
        SELECT e.*
        FROM ${TableName.EMPLOYEES} e
        INNER JOIN ${TableName.ROLES} r ON (r.id = e.role_id AND r.deleted_at IS NULL)
        WHERE e.deleted_at IS NULL
            AND r.code = $1
    `, [roleCode]);

    return isEmpty(rows) ? [] : map(rows, (row) => {
        return toEntity(Employee, row)
    });
}

async function addDeliveriesToPayrollCover (payrollCoverIds: number[], quantity: number): Promise<any> {
    if (isEmpty(payrollCoverIds)) {
        return;
    }

    let parametersCount = 2;
    const placeholders = reduce(payrollCoverIds, (acc: string, _, index: number) => {
        acc += `$${parametersCount}` + (index < (payrollCoverIds.length - 1) ? ',' : '');
        parametersCount += 1;
        return acc;
    }, '');

    const { rows } = await db.query(`
        UPDATE ${TableName.PAYROLL_COVER} pc
            SET deliveries_count = deliveries_count + $1
        FROM ${TableName.EMPLOYEES} e
        WHERE e.id = pc.employee_id AND e.deleted_at IS NULL AND pc.deleted_at IS NULL
            AND pc.id IN (${placeholders})
    `, [
        quantity, ...payrollCoverIds
    ]);

    return;
}
