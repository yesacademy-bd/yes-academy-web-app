const fs = require('fs');

const path = 'src/components/reports/LeaveRequestManagementClient.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add the import
if (!code.includes('deleteLeaveRequest')) {
  code = code.replace(
    "import { createClient } from '@/utils/supabase/client'",
    "import { createClient } from '@/utils/supabase/client'\nimport { deleteLeaveRequest } from '@/app/actions/leave-requests'"
  );
}

// Update handleDelete
const newHandleDelete = `
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) return;
    
    setLoading(true);
    const result = await deleteLeaveRequest(id);
    if (result.success) {
      loadRequests();
    } else {
      alert('Failed to delete: ' + result.message);
      setLoading(false);
    }
  }
`;

code = code.replace(
  /const handleDelete = async \([\s\S]*?\}\s*}/,
  newHandleDelete.trim()
);

fs.writeFileSync(path, code);
