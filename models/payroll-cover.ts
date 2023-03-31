import { BaseModel } from "./base-model";
import { Employee } from "./employee";

export class PayrollCover extends BaseModel {
    employeeId: number;
    employeeHourlyRate: number;
    registeredHours: number;
    deliveriesCount: number;
    paymentDate: number;

    employee?: Employee;
}
