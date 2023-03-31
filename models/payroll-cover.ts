import { BaseModel } from "./base-model";

export class PayrollCover extends BaseModel {
    employeeId: number;
    employeeHourlyRate: number;
    registeredHours: number;
    deliveriesCount: number;
    paymentDate: number;
}
