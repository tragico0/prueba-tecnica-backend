/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { TableName } from '../database';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        INSERT INTO ${TableName.TAXES}
        (label, code, percentage, amount, disabled)
        VALUES
        ('ISR', 'ISR_9', 9.0, null, false),
        ('ISR > $10,000', 'ISR_GT_10000', 3.0, null, false),
        ('Vales de despensa', 'GROCERY_VOUCHERS_4', 4, null, false)
        ;
    `);
}

export async function down (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        DELETE FROM ${TableName.TAXES}
        WHERE code IN ('ISR_9', 'ISR_GT_10000', 'GROCERY_VOUCHERS_4');
    `);
}
