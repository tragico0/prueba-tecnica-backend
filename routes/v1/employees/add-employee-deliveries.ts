import { Request, Response } from "express";
import { head, isEmpty, isNil } from "lodash";
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import db, { TableName } from '../../../database';
import moment, { Moment } from 'moment-timezone';
import Config from '../../../config';
import { Employee } from "../../../models/employee";
import { toEntity } from "../../../database/utils";
import { PayrollCover } from "../../../models/payroll-cover";
import { plainToClassFromExist } from "class-transformer";

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
        const employee = await findEmployeeByReference(employeeReference);

        if (isNil(employee)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: ReasonPhrases.BAD_REQUEST
            });
        }

        const monthIndex = (selectedMonth - 1);
        const targetMonth = moment.utc().tz(Config.defaultTimezone).month(monthIndex);
        const currentMonth = moment.utc().tz(Config.defaultTimezone);
        const isCurrentMonth = targetMonth.isSame(currentMonth, 'month');
        if (!isCurrentMonth) {
            return res.status(400).json({
                message: 'Is not possible to add deliveries to past/future months'
            });
        }

        const [payrollCover] = await findOrCreatePayrollCover(employee, targetMonth, deliveriesQuantity);
        const updatedPayrollCover = await addDeliveriesToPayrollCover(
            payrollCover.id,
            deliveriesQuantity
        );

        return res.status(200).json({     
            data: plainToClassFromExist(payrollCover, updatedPayrollCover)
        });

    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function findEmployeeByReference (employeeReference: string) {
    const { rows: [employee] } = await db.query(`
        SELECT * FROM ${TableName.EMPLOYEES}
        WHERE reference = $1
    `, [employeeReference])

    return toEntity(Employee, employee);
}

async function findOrCreatePayrollCover (
    employee: Employee,
    selectedMonth: Moment,
    deliveriesQuantity: number
): Promise<[PayrollCover, boolean]> {
    const startOfMonth = selectedMonth.clone().startOf('month');
    const endOfMonth = selectedMonth.clone().endOf('month');

    let { rows: [payrollCover] } = await db.query(`
        SELECT * FROM ${TableName.PAYROLL_COVER}
        WHERE employee_id = $1
            AND created_at BETWEEN $2 AND $3;
    `, [
        employee.id, startOfMonth.toISOString(), endOfMonth.toISOString()
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

async function addDeliveriesToPayrollCover (payrollCoverId: number, quantity: number): Promise<Partial<PayrollCover>> {
    const { rows: [result] } = await db.query(`
        UPDATE ${TableName.PAYROLL_COVER}
        SET deliveries_count = deliveries_count + $1
        WHERE id = $2
        RETURNING deliveries_count
    `, [
        quantity, payrollCoverId
    ]);

    return toEntity(PayrollCover, result);
}
