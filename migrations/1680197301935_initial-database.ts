import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { TableName } from '../database';
import { TimestampedTable } from '../database/utils';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(TableName.EMPLOYEES, TimestampedTable(pgm, {
        reference: { type: 'varchar' },
        first_name: { type: 'varchar' },
        first_last_name: { type: 'varchar' },
        hourly_rate: { type: 'float' },
        role_code: { type: 'varchar' }
    }));

    pgm.createTable(TableName.BONUS, TimestampedTable(pgm, {
        label: { type: 'varchar' },
        code: { type: 'varchar' },
        periodicy: { type: 'varchar' },
        percentage: { type: 'float' },
        amount: { type: 'float' },
        disabled: { type: 'boolean' }
    }));

    pgm.createTable(TableName.TAXES, TimestampedTable(pgm, {
        label: { type: 'varchar' },
        code: { type: 'varchar' },
        percentage: { type: 'float' },
        amount: { type: 'float' },
        disabled: { type: 'boolean' }
    }));

    pgm.createTable(TableName.PAYROLL_COVER, TimestampedTable(pgm, {
        employee_id: {
            type: 'int',
            references: TableName.EMPLOYEES,
            referencesConstraintName: 'fkey_payroll_cover_employee_id'
        },
        employee_hourly_rate: { type: 'float' },
        registered_hours: { type: 'float' },
        deliveries_count: { type: 'int' },
        payment_date: { type: 'timestamptz' }
    }));

    pgm.createTable(TableName.PAYROLL_ROW, TimestampedTable(pgm, {
        payroll_id: {
            type: 'int',
            references: TableName.PAYROLL_COVER,
            referencesConstraintName: 'fkey_payroll_row_payroll_id'
        },
        bonus_id: {
            type: 'int',
            references: TableName.BONUS,
            referencesConstraintName: 'fkey_payroll_row_bonus_id'
        },
        tax_id: {
            type: 'int',
            references: TableName.TAXES,
            referencesConstraintName: 'fkey_payroll_row_tax_id'
        },
    }));
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable(TableName.PAYROLL_ROW);
    pgm.dropTable(TableName.PAYROLL_COVER);
    pgm.dropTable(TableName.TAXES);
    pgm.dropTable(TableName.BONUS);
    pgm.dropTable(TableName.EMPLOYEES);
}
