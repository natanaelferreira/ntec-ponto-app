import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gilmehnunjlxdbpkhqbx.supabase.co'
const supabaseKey = 'sb_publishable_DtHxTIZVzBFKthyiQcYJBw_ZkDR8Up6'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)