import { ClassConstructor, plainToInstance } from "class-transformer";
import { camelizeKeys } from "fast-case";
import { forEach, isNil, keys, map, reduce } from "lodash";
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

export function toEntity<T>(cls: ClassConstructor<T>, object: any, alias?: string) {
    const fields = keys(object);

    if (isNil(alias)) {
        return plainToInstance(cls, camelizeKeys(object));
    } else {
        const aliasConvention = alias + '__';
        const mappedObject = reduce<string, any>(fields, (acc, field) => {
            if (field.startsWith(aliasConvention)) {
                const fieldWithNoPrefix = field.replace(aliasConvention, '');
                acc[fieldWithNoPrefix] = object[field];
            }

            return acc;
        }, {});

        return plainToInstance(cls, camelizeKeys(mappedObject));
    }
}
