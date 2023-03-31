import { ClassConstructor, plainToInstance } from "class-transformer";
import { camelizeKeys } from "fast-case";
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export function TimestampedTable (pgm: MigrationBuilder, columnDefinitions: ColumnDefinitions): ColumnDefinitions {
    return {
        id: 'id',
        ...columnDefinitions,
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        deleted_at: { type: 'timestamptz' }
    };
}

export function toEntity<T>(cls: ClassConstructor<T>, object: any) {
    return plainToInstance(cls, camelizeKeys(object));
}
