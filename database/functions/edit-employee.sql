DROP FUNCTION IF EXISTS edit_employee;
CREATE FUNCTION edit_employee (
    employee_id int,
    employee_reference varchar,
    employee_first_name varchar,
    employee_first_last_name varchar,
    employee_hourly_rate float,
    employee_role_id int
)
RETURNS employees
LANGUAGE plpgsql
AS $$
DECLARE
    created_at timestamptz := current_timestamp;
    employee record;
BEGIN

    UPDATE employees
    SET 
        reference = employee_reference,
        first_name = employee_first_name,
        first_last_name = employee_first_last_name,
        hourly_rate = employee_hourly_rate,
        role_id = employee_role_id
    WHERE
        id = employee_id;

    SELECT *
    FROM employees
    WHERE id = employee_id
    INTO employee;
  
    RETURN employee;

END; $$;
