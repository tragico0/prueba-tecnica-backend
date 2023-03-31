import databaseConnection from './connection';

export enum TableName {
    TAXES = 'taxes',
    BONUS = 'bonus',
    EMPLOYEES = 'employees',
    PAYROLL_COVER = 'payroll_cover',
    PAYROLL_ROW = 'payroll_row'
}

export default databaseConnection;
