import { BaseModel } from "./base-model";

export enum RoleCode {
    DRIVER = 'DRIVER',
    LOADER = 'LOADER',
    AUXILIARY = 'AUXILIARY'
}

export class Employee extends BaseModel {
    hourlyRate: number;
}
