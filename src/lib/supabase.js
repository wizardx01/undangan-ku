import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uubobyawvebrewvmnebd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Ym9ieWF3dmVicmV3dm1uZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzUzMTIsImV4cCI6MjA5MjQ1MTMxMn0.RihAQAWyIta4VmFgrZUBTWkCH0_4Oqj1J3eBIitVVto'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)