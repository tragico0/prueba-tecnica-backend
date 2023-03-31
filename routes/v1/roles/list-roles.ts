import { Request, Response } from 'express';
import { values } from 'lodash';
import { RoleCode } from '../../../models/employee';

export default async (req: Request, res: Response) => {
    res.status(200).json({
        data: values(RoleCode)
    });
}
