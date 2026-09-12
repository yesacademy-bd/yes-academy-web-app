const fs = require('fs');

const enrollActionsPath = 'src/app/dashboard/admin/batches/enroll-actions.ts';
let actions = fs.readFileSync(enrollActionsPath, 'utf8');

if (!actions.includes('cancelEnrollment')) {
  actions += `\n\nexport async function cancelEnrollment(enrollmentId: string, remarks: string, batchId: string) {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('enrollments')
      .update({ status: 'Cancelled', remarks })
      .eq('id', enrollmentId)
      
    if (error) return { success: false, message: error.message }
    revalidatePath(\`/dashboard/admin/batches/\${batchId}\`)
    revalidatePath(\`/dashboard/enrollments\`)
    return { success: true }
  } catch(e: any) {
    return { success: false, message: e.message }
  }
}

export async function switchEnrollment(oldEnrollmentId: string, newBatchId: string, remarks: string, currentBatchId: string) {
  try {
    const adminClient = createAdminClient()
    
    // 1. Fetch old enrollment
    const { data: oldData, error: fetchErr } = await adminClient
      .from('enrollments')
      .select('*')
      .eq('id', oldEnrollmentId)
      .single()
      
    if (fetchErr) return { success: false, message: fetchErr.message }
    
    // 2. Clone to new batch
    const { data: newEnrollment, error: insertErr } = await adminClient
      .from('enrollments')
      .insert({
        student_id: oldData.student_id,
        batch_id: newBatchId,
        course_fee: oldData.course_fee,
        paid_amount: oldData.paid_amount,
        due_amount: oldData.due_amount,
        payment_method: oldData.payment_method,
        reference: oldData.reference,
        status: 'Active'
      })
      .select()
      .single()
      
    if (insertErr) return { success: false, message: insertErr.message }
    
    // 3. Mark old as switched
    const { error: updateErr } = await adminClient
      .from('enrollments')
      .update({ status: 'Switched', remarks })
      .eq('id', oldEnrollmentId)
      
    if (updateErr) return { success: false, message: updateErr.message }
    
    revalidatePath(\`/dashboard/admin/batches/\${currentBatchId}\`)
    revalidatePath(\`/dashboard/admin/batches/\${newBatchId}\`)
    revalidatePath(\`/dashboard/enrollments\`)
    return { success: true }
  } catch(e: any) {
    return { success: false, message: e.message }
  }
}
`;
  fs.writeFileSync(enrollActionsPath, actions);
}

const mainActionsPath = 'src/app/dashboard/enrollments/actions.ts';
let mainActions = fs.readFileSync(mainActionsPath, 'utf8');

if (!mainActions.includes('searchEnrollments')) {
  mainActions += `\n\nexport async function searchEnrollments(batchId: string, studentName: string) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('enrollments')
      .select(\`
        id, status, course_fee, paid_amount, due_amount, reference, batch_id, remarks,
        students!inner ( id, name, phone ),
        batches ( id, batch_name )
      \`)
      .eq('status', 'Active')
      
    if (batchId) {
      query = query.eq('batch_id', batchId)
    }
    
    if (studentName) {
      query = query.ilike('students.name', \`%\${studentName}%\`)
    }
    
    const { data, error } = await query.limit(50)
    if (error) throw error
    return { success: true, data }
  } catch(e: any) {
    return { success: false, message: e.message }
  }
}
`;
  fs.writeFileSync(mainActionsPath, mainActions);
}
