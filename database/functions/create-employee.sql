DROP FUNCTION IF EXISTS create_employee;
CREATE FUNCTION create_employee (
    reference varchar,
    first_name varchar,
    first_last_name varchar,
    hourly_rate float,
    role_code varchar
)
RETURNS employees
LANGUAGE plpgsql
AS $$
DECLARE
    created_at timestamptz := current_timestamp;
    employee record;
BEGIN

    INSERT INTO employees
    (reference, first_name, first_last_name, hourly_rate, role_code)
    VALUES
    (reference, first_name, first_last_name, hourly_rate, role_code)
    RETURNING *
    INTO employee;
  
    RETURN employee;

END; $$;
