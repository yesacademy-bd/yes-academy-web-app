const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/actions.ts', 'utf8');

// Update roles
code = code.replace(
  /\!\[\'Admin\', \'HR\', \'BDM\'\]\.includes/g,
  "!['Admin', 'HR', 'BDM', 'Faculty'].includes"
);
code = code.replace(
  /message: 'Admin, HR, or BDM only/g,
  "message: 'Admin, HR, BDM, or Faculty only"
);

// Extract IELTS fields
const extractRegex = /const exam_venue = formData\.get\('exam_venue'\) as string/;
const newExtract = `const exam_venue = formData.get('exam_venue') as string
  const speaking_time = formData.get('speaking_time') as string || null
  const speaking_method = formData.get('speaking_method') as string || null
  const assigned_speaking_teacher = formData.get('assigned_speaking_teacher') as string || null`;
code = code.replace(extractRegex, newExtract);

// Insert IELTS fields
const insertRegex = /exam_venue,\s*registered_by:/;
const newInsert = `exam_venue,
      speaking_time: mock_type === 'IELTS Mock' ? speaking_time : null,
      speaking_method: mock_type === 'IELTS Mock' ? speaking_method : null,
      assigned_speaking_teacher: mock_type === 'IELTS Mock' ? assigned_speaking_teacher : null,
      registered_by:`;
code = code.replace(insertRegex, newInsert);

// Add updateMockDate function
const updateFn = `
export async function updateMockDate(id: string, newDate: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['Admin', 'HR', 'BDM', 'Faculty'].includes(profile?.role || '')) return { success: false, message: 'Unauthorized role' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('mock_services')
    .update({ exam_date: newDate })
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard/mocks')
  return { success: true }
}
`;

code = code + updateFn;

fs.writeFileSync('src/app/dashboard/mocks/actions.ts', code);
console.log('actions.ts patched');
