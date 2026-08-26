'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyHR() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'HR' && profile?.role !== 'Admin') {
    throw new Error('Forbidden: Only HR or Admin can manage users.')
  }
  return user
}

export async function createStaffUser(prevState: any, formData: FormData) {
  try {
    await verifyHR()
    const adminClient = createAdminClient()
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    
    // 1. Create in Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError) return { success: false, message: authError.message }
    if (!authUser.user) return { success: false, message: 'Failed to create user' }
    
    // 2. Insert Profile
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authUser.user.id,
      email,
      display_name: name,
      role: role
    })
    
    if (profileError) {
      // Rollback
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return { success: false, message: 'Failed to create profile: ' + profileError.message }
    }
    
    revalidatePath('/dashboard/hr/users')
    return { success: true, message: 'User created successfully!' }
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred' }
  }
}

export async function deleteStaffUser(userId: string) {
  try {
    await verifyHR()
    const adminClient = createAdminClient()
    
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    
    if (error) {
      return { 
        success: false, 
        message: 'Database handling error: Cannot delete user because they have historical data (batches, attendance). Please suspend them instead.' 
      }
    }
    
    revalidatePath('/dashboard/hr/users')
    return { success: true, message: 'User deleted successfully!' }
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred' }
  }
}

export async function toggleUserSuspension(userId: string, suspend: boolean) {
  try {
    await verifyHR()
    const adminClient = createAdminClient()
    
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: suspend ? '876000h' : 'none' // roughly 100 years
    })
    
    if (error) return { success: false, message: error.message }
    
    revalidatePath('/dashboard/hr/users')
    return { success: true, message: suspend ? 'User suspended successfully' : 'User reactivated successfully' }
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred' }
  }
}
