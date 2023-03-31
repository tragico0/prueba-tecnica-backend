import { BaseModel } from "./base-model";

export enum RoleCode {
    DRIVER = 'DRIVER',
    LOADER = 'LOADER',
    AUXILIARY = 'AUXILIARY'
}

export class Employee extends BaseModel {
    reference: string;
    firstName: string;
    firstLastName: string;
    hourlyRate: number;
    roleId: number;
}
