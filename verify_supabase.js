import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');

    try {
        const { data, error } = await supabase
            .from('rounds')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Connection failed:', error.message);
        } else {
            console.log('Connection successful!');
            console.log('Rounds table accessed. Rows found:', data.length);

            // Test RPC function
            console.log('Testing get_storage_usage RPC function...');
            const { data: storageData, error: storageError } = await supabase.rpc('get_storage_usage');

            if (storageError) {
                console.error('RPC function check failed:', storageError.message);
                console.log('IMPORTANT: Please run the SQL from supabase_storage_usage.sql in your Supabase SQL Editor.');
            } else {
                console.log('RPC function working! Current storage usage:', storageData, 'bytes');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
