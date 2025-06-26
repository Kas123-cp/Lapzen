
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(https://odsyiibwevwydsjtgktl.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kc3lpaWJ3ZXZ3eWRzanRna3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDM3NDMsImV4cCI6MjA2NjUxOTc0M30.OS5BuZF59Y3HuBWY1D4vg1p_8P24ABODKgpp73nVv18)

const { data, error } = await supabase
  .from('todos')
  .select()
