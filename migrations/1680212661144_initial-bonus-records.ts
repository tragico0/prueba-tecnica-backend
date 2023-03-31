/* eslint-disable @typescript-eslint/naming-convention */
import { forEach, keyBy, map, reduce } from 'lodash';
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { TableName } from '../database';
import { BonusPeriodicy } from '../models/bonus';
import { RoleCode } from '../models/employee';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up (pgm: MigrationBuilder): Promise<void> {
    const roles = await rolesIdsByCode(pgm);

    await pgm.db.query(`
        INSERT INTO ${TableName.BONUS}
        (label, code, periodicy, percentage, amount, disabled, role_id)
        VALUES
        ('Bono por entrega', 'BONUS_PER_DELIVERY', '${BonusPeriodicy.DELIVERY}', null, 5, false, null),
        ('Bono por hora', 'BONUS_PER_HOUR_PER_ROLE_DRIVER', '${BonusPeriodicy.HOUR}', null, 10, false, ${roles[RoleCode.DRIVER]}),
        ('Bono por hora', 'BONUS_PER_HOUR_PER_ROLE_LOADER', '${BonusPeriodicy.HOUR}', null, 5, false, ${roles[RoleCode.LOADER]})
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

async function rolesIdsByCode (pgm: MigrationBuilder) {
    const { rows: roles } = await  pgm.db.query(`SELECT * FROM ${TableName.ROLES}`);
    return reduce(roles, (acc: any, role: any) => {
        acc[role.code] = role.id;
        return acc;
    }, {});
}
