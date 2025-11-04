import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pxfalmjmsxtwcktcmycy.supabase.co'
const supabaseAnonKey = 'sb_publishable_PfVrw1RM8VdnSdpBUUx4wA_Tpx48nSY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
