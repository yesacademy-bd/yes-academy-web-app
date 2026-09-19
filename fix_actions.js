const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', 'utf8');

const oldCancel = `export async function cancelEnrollment(enrollmentId: string, remarks: string, batchId: string) {
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
}`

const newCancel = `export async function cancelEnrollment(enrollmentId: string, remarks: string, batchId: string, refundAmount: number = 0, studentName: string = '') {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('enrollments')
      .update({ status: 'Cancelled', remarks })
      .eq('id', enrollmentId)
      
    if (error) return { success: false, message: error.message }
    
    // Process Refund Expense if greater than 0
    if (refundAmount > 0) {
      const { error: expError } = await adminClient
        .from('expenses')
        .insert({
          date: new Date().toISOString().split('T')[0],
          category: 'Refund',
          description: \`Refunded Admission - \${studentName}\`,
          amount: refundAmount,
          payment_method: 'Cash'
        })
      if (expError) console.error('Refund Expense Error:', expError)
    }

    revalidatePath(\`/dashboard/admin/batches/\${batchId}\`)
    revalidatePath(\`/dashboard/enrollments\`)
    revalidatePath(\`/dashboard/crm\`)
    return { success: true }
  } catch(e: any) {
    return { success: false, message: e.message }
  }
}`

if (code.includes(oldCancel)) {
    code = code.replace(oldCancel, newCancel);
    fs.writeFileSync('src/app/dashboard/admin/batches/enroll-actions.ts', code);
    console.log("Updated enroll-actions");
} else {
    console.log("Could not find old cancel function");
}
