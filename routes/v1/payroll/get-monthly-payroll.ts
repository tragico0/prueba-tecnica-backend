import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { filter, find, forEach, groupBy, isNil, isNull, keyBy, map, reduce } from 'lodash';
import db, { TableName } from '../../../database';
import { toEntity } from '../../../database/utils';
import { Bonus, BonusCode, BonusPeriodicy } from '../../../models/bonus';
import { Employee } from '../../../models/employee';
import { PayrollCover } from '../../../models/payroll-cover';
import { Role } from '../../../models/role';
import moment from 'moment-timezone';
import Config from '../../../config';
import { Tax, TaxCode } from '../../../models/tax';

export default async (req: Request, res: Response) => {
    try {
        const allBonuses = await getBonuses();
        const allTaxes = await getTaxes();
        const payrollCovers = await getPayrollCovers();
        const groceryVoucherTax = find(allTaxes, (tax) => tax.code === TaxCode.GROCERY_VOUCHERS_4);
        const deliveryBonus = find(allBonuses, (bonus) => bonus.code === BonusCode.BONUS_PER_DELIVERY);

        const results = map(payrollCovers, (payrollCover) => {
            const employee = payrollCover.employee ?? new Employee();

            const baseSalary = payrollCover.registeredHours * payrollCover.employeeHourlyRate;
            const bonusesPayment = calculateBonusesPayment(payrollCover, allBonuses);
            const deliveriesPayment = payrollCover.deliveriesCount * (deliveryBonus?.amount ?? 0);
            const grossSalary = (baseSalary + bonusesPayment + deliveriesPayment);

            const salaryBreakdown = {
                employeeId: employee.id,
                employeeReference: employee.reference,
                name: `${employee.firstName} ${employee.firstLastName}`,
                registeredHours: payrollCover.registeredHours,
                deliveriesCount: payrollCover.deliveriesCount,
                deliveriesPayment: deliveriesPayment,
                bonusesPayment: bonusesPayment,
                baseSalary: baseSalary,
                grossSalary: grossSalary,
                taxesPayment: calculateTaxesPayment(grossSalary, allTaxes),
                groceryVouchersPayment: grossSalary * ((groceryVoucherTax?.percentage ?? 0) / 100)
            };

            return {
                ...salaryBreakdown,
                netTotal: calculateNetTotal(salaryBreakdown)
            }
        });

        res.status(200).json({
            data: results
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

class BonusWithRoleCode extends Bonus {
    roleCode: string;
}

async function getBonuses () {
    const { rows } = await db.query(`
        SELECT b.*, r.code AS role_code
        FROM ${TableName.BONUS} b
        LEFT JOIN ${TableName.ROLES} r ON r.id = b.role_id AND r.deleted_at IS NULL
        WHERE b.deleted_at IS NULL
            AND NOT b.disabled
    `);

    return map(rows, (bonus) => toEntity(BonusWithRoleCode, bonus));
}

async function getTaxes () {
    const { rows } = await db.query(`
        SELECT * FROM ${TableName.TAXES} t
        WHERE t.deleted_at IS NULL
            AND NOT t.disabled
    `);

    return map(rows, (bonus) => toEntity(Tax, bonus));
}

async function getPayrollCovers () {
    const startOfMonth = moment.utc().tz(Config.defaultTimezone).startOf('month');
    const endOfMonth = startOfMonth.clone().endOf('month');

    const { rows } = await db.query(`
        SELECT
            pc.id AS "pc__id",
            pc.employee_id AS "pc__employee_id",
            pc.employee_hourly_rate AS "pc__employee_hourly_rate",
            pc.registered_hours AS "pc__registered_hours",
            pc.deliveries_count AS "pc__deliveries_count",
            pc.payment_date AS "pc__payment_date",
            pc.created_at AS "pc__created_at",
            pc.updated_at AS "pc__updated_at",
            pc.deleted_at AS "pc__deleted_at",
            e.id AS "e__id",
            e.reference AS "e__reference",
            e.first_name AS "e__first_name",
            e.first_last_name AS "e__first_last_name",
            e.hourly_rate AS "e__hourly_rate",
            e.role_id AS "e__role_id",
            e.created_at AS "e__created_at",
            e.updated_at AS "e__updated_at",
            e.deleted_at AS "e__deleted_at"
        FROM payroll_cover pc
        INNER JOIN employees e ON e.id = pc.employee_id AND e.deleted_at IS NULL
        WHERE pc.deleted_at IS NULL
            AND pc.created_at BETWEEN $1 AND $2
    `, [
        startOfMonth.toISOString(), endOfMonth.toISOString()
    ]);

    return map(rows, (row) => {
        const payrollCover = toEntity(PayrollCover, row, 'pc');
        payrollCover.employee = toEntity(Employee, row, 'e');

        return payrollCover;
    });
}

function calculateBonusesPayment (payrollCover: PayrollCover, allBonuses: Bonus[]) {
    let bonusTotal = 0;
    
    forEach(allBonuses, bonus => {
        if (!isNil(payrollCover.employee?.roleId) && bonus.roleId === payrollCover.employee?.roleId) {
            if (bonus.periodicy === BonusPeriodicy.HOUR) {
                switch (bonus.code) {
                    case BonusCode.BONUS_PER_HOUR_PER_ROLE_DRIVER:
                    case BonusCode.BONUS_PER_HOUR_PER_ROLE_LOADER:
                        bonusTotal += payrollCover.registeredHours * bonus.amount
                        break;
    
                    default:
                        break;
                }
            }
        }
    });

    return bonusTotal;
}

function calculateTaxesPayment (grossSalary: number, allTaxes: Tax[]) {
    let taxTotal = 0;
    
    forEach(allTaxes, tax => {
        switch (tax.code) {
            case TaxCode.ISR_9:
                taxTotal += grossSalary * (tax.percentage / 100)
                break;

            case TaxCode.ISR_GT_10000:
                if (grossSalary > 10000) {
                    taxTotal += grossSalary * (tax.percentage / 100)
                }

            default:
                break;
        }
    });

    return taxTotal;
}

function calculateNetTotal (salaryBreakdown: any) {
    let total = 0;

    total += salaryBreakdown.grossSalary;
    total += salaryBreakdown.deliveriesPayment;
    total += salaryBreakdown.bonusesPayment;
    total -= salaryBreakdown.taxesPayment;
    total -= salaryBreakdown.groceryVouchersPayment;

    return total;
}
