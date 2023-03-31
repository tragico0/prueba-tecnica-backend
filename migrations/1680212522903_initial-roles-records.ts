/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { TableName } from '../database';
import { RoleCode } from '../models/employee';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        INSERT INTO ${TableName.ROLES}
        (code)
        VALUES
        ('${RoleCode.DRIVER}'),
        ('${RoleCode.LOADER}'),
        ('${RoleCode.AUXILIARY}')
        ;
    `);
}

export async function down (pgm: MigrationBuilder): Promise<void> {
    pgm.db.query(`
        DELETE FROM ${TableName.ROLES}
        WHERE code IN (
            '${RoleCode.DRIVER}',
            '${RoleCode.LOADER}',
            '${RoleCode.AUXILIARY}'
        );
    `);
}
