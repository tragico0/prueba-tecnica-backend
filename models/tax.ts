import { BaseModel } from "./base-model";

export enum TaxCode {
    ISR_9 = 'ISR_9',
    ISR_GT_10000 = 'ISR_GT_10000',
    GROCERY_VOUCHERS_4 = 'GROCERY_VOUCHERS_4'
}

export class Tax extends BaseModel {
    label: string;
    code: string;
    percentage: number;
    amount: number;
    disabled: boolean;
}
