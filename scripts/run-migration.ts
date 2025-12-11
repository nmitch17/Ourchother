// Run the migration to remove internal/external project distinction
// Usage: npx tsx scripts/run-migration.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running migration: Remove Internal/External Project Distinction\n')

  // Step 1: Create Ourchother client
  console.log('Step 1: Creating Ourchother client...')
  const { error: clientError } = await supabase
    .from('clients')
    .upsert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ourchother',
      email: 'internal@ourchother.com',
      phone: null,
      company: 'Ourchother',
    }, { onConflict: 'id' })

  if (clientError) {
    console.error('❌ Failed to create Ourchother client:', clientError.message)
    process.exit(1)
  }
  console.log('✅ Ourchother client created/exists\n')

  // Step 2: Check for orphaned projects
  console.log('Step 2: Checking for orphaned projects (null client_id)...')
  const { data: orphanedProjects, error: orphanError } = await supabase
    .from('projects')
    .select('id, name')
    .is('client_id', null)

  if (orphanError) {
    console.error('❌ Failed to check orphaned projects:', orphanError.message)
    process.exit(1)
  }

  if (orphanedProjects && orphanedProjects.length > 0) {
    console.log(`Found ${orphanedProjects.length} orphaned project(s):`)
    orphanedProjects.forEach(p => console.log(`  - ${p.name} (${p.id})`))

    // Migrate them
    console.log('\nMigrating orphaned projects to Ourchother...')
    const { error: updateError } = await supabase
      .from('projects')
      .update({ client_id: '00000000-0000-0000-0000-000000000001' })
      .is('client_id', null)

    if (updateError) {
      console.error('❌ Failed to migrate orphaned projects:', updateError.message)
      process.exit(1)
    }
    console.log('✅ Orphaned projects migrated\n')
  } else {
    console.log('✅ No orphaned projects found\n')
  }

  // Step 3 & 4: ALTER TABLE commands need to be run via SQL
  // These can't be done via the Supabase client, they need raw SQL
  console.log('Step 3 & 4: Schema changes (ALTER TABLE) need to be run in Supabase SQL Editor:')
  console.log('   -- Make client_id required')
  console.log('   ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;')
  console.log('   -- Make type nullable')
  console.log('   ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;')
  console.log('')
  console.log('📋 Copy the SQL above to your Supabase Dashboard > SQL Editor')
  console.log('')

  // Verify migration
  console.log('Verifying migration...')
  const { data: ourchother } = await supabase
    .from('clients')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single()

  if (ourchother) {
    console.log('✅ Ourchother client exists:', ourchother.name)
  }

  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .is('client_id', null)

  console.log(`✅ Projects without client_id: ${count || 0}`)

  console.log('\n🎉 Migration data steps complete!')
}

runMigration().catch(console.error)
