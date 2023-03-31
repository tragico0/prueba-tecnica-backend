DROP FUNCTION IF EXISTS create_payroll_cover;
CREATE FUNCTION create_payroll_cover (
    employee_id int,
    employee_hourly_rate int,
    registered_hours float,
    deliveries_count int,
    payment_date timestamptz
)
RETURNS payroll_cover
LANGUAGE plpgsql
AS $$
DECLARE
    payroll_cover record;
BEGIN

    INSERT INTO payroll_cover
    (employee_id, employee_hourly_rate, registered_hours, deliveries_count, payment_date)
    VALUES
    (employee_id, employee_hourly_rate, registered_hours, deliveries_count, payment_date)
    RETURNING *
    INTO payroll_cover;
  
    RETURN payroll_cover;

END; $$;
