import { BaseModel } from "./base-model";

export enum BonusPeriodicy {
    'HOUR' = 'HOUR',
    'WEEK' = 'WEEK',
    'MONTH' = 'MONTH',
    'DELIVERY' = 'DELIVERY'
}

export enum BonusCode {
    BONUS_PER_DELIVERY = 'BONUS_PER_DELIVERY',
    BONUS_PER_HOUR_PER_ROLE_DRIVER = 'BONUS_PER_HOUR_PER_ROLE_DRIVER',
    BONUS_PER_HOUR_PER_ROLE_LOADER = 'BONUS_PER_HOUR_PER_ROLE_LOADER'
}

export class Bonus extends BaseModel {
    label: string;
    code: string;
    periodicy: string;
    percentage: number;
    amount: number;
    disabled: boolean;
    roleId: number;
}
