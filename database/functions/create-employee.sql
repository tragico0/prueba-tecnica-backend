DROP FUNCTION IF EXISTS create_employee;
CREATE FUNCTION create_employee (
    reference varchar,
    first_name varchar,
    first_last_name varchar,
    hourly_rate float,
    role_id int
)
RETURNS employees
LANGUAGE plpgsql
AS $$
DECLARE
    created_at timestamptz := current_timestamp;
    employee record;
BEGIN

    INSERT INTO employees
    (reference, first_name, first_last_name, hourly_rate, role_id)
    VALUES
    (reference, first_name, first_last_name, hourly_rate, role_id)
    RETURNING *
    INTO employee;
  
    RETURN employee;

END; $$;
