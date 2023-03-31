/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { TableName } from '../database';
import { BonusPeriodicy } from '../models/bonuses';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        INSERT INTO ${TableName.BONUS}
        (label, code, periodicy, percentage, amount, disabled)
        VALUES
        ('Bono por entrega', 'BONUS_PER_DELIVERY', '${BonusPeriodicy.DELIVERY}', null, 5, false),
        ('Bono por hora', 'BONUS_PER_HOUR_PER_ROLE_DRIVER', '${BonusPeriodicy.HOUR}', null, 10, false),
        ('Bono por hora', 'BONUS_PER_HOUR_PER_ROLE_LOADER', '${BonusPeriodicy.HOUR}', null, 5, false)
        ;
    `);
}

export async function down (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        DELETE FROM ${TableName.BONUS}
        WHERE code IN (
            'BONUS_PER_DELIVERY',
            'BONUS_PER_HOUR_PER_ROLE_DRIVER',
            'BONUS_PER_HOUR_PER_ROLE_LOADER'
        );
    `);
}
