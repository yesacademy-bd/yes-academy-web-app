import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'HR') {
    return <div className="text-red-500 font-medium p-8">Access Denied. HR only.</div>
  }

  // Fetch current settings
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500">Configure global defaults and academy preferences.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Placeholder form for settings */}
        <form className="p-6 sm:p-8 space-y-8" action={async () => {
          'use server';
          // Stub for updating settings
        }}>
          
          <div className="space-y-4 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-semibold text-gray-900">Global Batch Defaults</h3>
            <p className="text-sm text-gray-500 mb-4">These values will pre-fill the form when creating new batches.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Max Students</label>
                <input 
                  type="number" 
                  name="default_max_students"
                  defaultValue={settings?.default_max_students}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Total Classes</label>
                <input 
                  type="number" 
                  name="default_total_classes"
                  defaultValue={settings?.default_total_classes}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Additional Classes</label>
                <input 
                  type="number" 
                  name="default_additional_classes"
                  defaultValue={settings?.default_additional_classes}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4">
             <h3 className="text-lg font-semibold text-gray-900">Role Mappings (Information)</h3>
             <p className="text-sm text-gray-500">
               Currently, roles (Admin, HR, Faculty) are mapped to user emails in the `profiles` table. 
               To change a user's role, an Admin must update their profile in the database or via the Supabase dashboard until the full User Management module is built.
             </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
