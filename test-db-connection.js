const { createClient } = require('@supabase/supabase-js');

// Test database connection and table structure
async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please check your .env.local file');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('oz_projects')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }

    console.log('✅ Database connection successful!');

    // Check table structure
    console.log('🔍 Checking table structure...');
    
    const { data: columns, error: columnError } = await supabase
      .from('oz_projects')
      .select('*')
      .limit(0);

    if (columnError) {
      console.error('❌ Error checking table structure:', columnError);
      return;
    }

    console.log('✅ Table structure check passed');

    // Test inserting a test record
    console.log('🔍 Testing insert functionality...');
    
    const testProjectId = 'test-' + Date.now();
    const { error: insertError } = await supabase
      .from('oz_projects')
      .insert({
        project_id: testProjectId,
        project_name: 'Test Project',
        submitted_by_email: 'test@example.com',
        submission_status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return;
    }

    console.log('✅ Insert test successful');

    // Clean up test record
    const { error: deleteError } = await supabase
      .from('oz_projects')
      .delete()
      .eq('project_id', testProjectId);

    if (deleteError) {
      console.error('⚠️ Warning: Could not clean up test record:', deleteError);
    } else {
      console.log('✅ Cleanup successful');
    }

    console.log('🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection(); 