-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_storage_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_storage_usage() TO service_role;

-- Ensure the function is reachable
NOTIFY pgrst, 'reload config';
