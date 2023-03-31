import { Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { map } from 'lodash';
import db, { TableName } from '../../../database';
import { toEntity } from '../../../database/utils';
import { Role } from '../../../models/role';

export default async (req: Request, res: Response) => {
    try {
        const roles = await getRoles();

        res.status(200).json({
            data: map(roles, (employee) => toEntity(Role, employee))
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        });
    }
}

async function getRoles () {
    const { rows } = await db.query(`
        SELECT * FROM ${TableName.ROLES}
    `);

    return rows;
}
