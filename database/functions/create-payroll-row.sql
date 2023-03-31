DROP FUNCTION IF EXISTS create_payroll_row;
CREATE FUNCTION create_payroll_row (
    payroll_id int,
    bonus_id int,
    tax_id int
)
RETURNS employees
LANGUAGE plpgsql
AS $$
DECLARE
    payroll_row record;
BEGIN

    INSERT INTO payroll_row
    (payroll_id, bonus_id, tax_id)
    VALUES
    (payroll_id, bonus_id, tax_id)
    RETURNING *
    INTO payroll_row;
  
    RETURN payroll_row;

END; $$;
