const fs = require('fs');

const path = 'src/components/reports/LeaveRequestManagementClient.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Trash2')) {
  code = code.replace(
    "import { Calendar, Filter, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'",
    "import { Calendar, Filter, Eye, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'"
  );
}

const deleteFunction = `
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) return;
    
    setLoading(true);
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (!error) {
      loadRequests();
    } else {
      alert('Failed to delete: ' + error.message);
      setLoading(false);
    }
  }
`;

if (!code.includes('handleDelete')) {
  code = code.replace(
    "const loadRequests = async () => {",
    deleteFunction + "\n\n  const loadRequests = async () => {"
  );
}

const newActionButtons = `
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={\`/dashboard/leave-requests/\${request.id}\`} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View
                          </Link>
                          <button onClick={() => handleDelete(request.id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
`;

const oldActionButtons = `<td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <Link href={\`/dashboard/leave-requests/\${request.id}\`} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </td>`;

// Actually we will use regex to be safe
if (!code.includes('onClick={() => handleDelete(request.id)}')) {
  code = code.replace(
    /<td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">[\s\S]*?<\/td>/,
    newActionButtons.trim()
  );
}

fs.writeFileSync(path, code);
