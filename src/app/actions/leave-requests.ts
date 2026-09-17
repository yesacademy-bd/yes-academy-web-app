'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function deleteLeaveRequest(id: string) {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('leave_requests').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
