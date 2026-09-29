const fs = require('fs')
let content = fs.readFileSync('src/components/batches/EnrollmentManager.tsx', 'utf8')

// 1. Update Imports
content = content.replace(
  "import { enrollStudent, removeEnrollment, updatePortalAssigned, updateEnrollmentPayment } from '@/app/dashboard/admin/batches/enroll-actions'",
  "import { enrollStudent, removeEnrollment, updatePortalAssigned, updateEnrollmentPayment, updateEnrollmentAndStudent } from '@/app/dashboard/admin/batches/enroll-actions'"
)

// 2. Add State
content = content.replace(
  "const [editingPayment, setEditingPayment] = useState<any>(null)",
  "const [editingPayment, setEditingPayment] = useState<any>(null)\n  const [editingStudent, setEditingStudent] = useState<any>(null)"
)

// 3. Add Dropdown Button
const deleteBtnRegex = /<button onClick=\{\(\) => \{ setOpenMenuId\(null\); handleRemove\(s\.id\); \}\}/;
content = content.replace(
  deleteBtnRegex,
  `<button onClick={() => { setOpenMenuId(null); setEditingStudent({ s, enrollment: s.enrollment_data }); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3b82f6] !text-white" style={{ WebkitTextFillColor: 'white' }}>
                              Edit Student Data
                            </button>
                            <button onClick={() => { setOpenMenuId(null); handleRemove(s.id); }}`
)

// 4. Add Modal
const paymentModalRegex = /\{\/\* Payment Edit Modal \*\/\}/;
const studentModal = `{/* Student Edit Modal */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-semibold text-white">Edit Student: {editingStudent.s.name}</h3>
                <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form className="p-4 space-y-4 overflow-y-auto" onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const btn = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
                const oldText = btn.innerText;
                btn.innerText = 'Saving...';
                btn.disabled = true;
                
                const res = await updateEnrollmentAndStudent(batchId, editingStudent.s.id, editingStudent.enrollment.id, form);
                if (res.success) {
                  alert("Student updated successfully!");
                  setEditingStudent(null);
                } else {
                  alert(res.message || "Failed to update student");
                  btn.innerText = oldText;
                  btn.disabled = false;
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Student ID (Optional)</label>
                  <input type="text" name="system_id" defaultValue={editingStudent.s.system_id || ''} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input type="text" name="name" defaultValue={editingStudent.s.name} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                    <input type="text" name="phone" defaultValue={editingStudent.s.phone || ''} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Guardian Phone</label>
                    <input type="text" name="guardian_phone" defaultValue={editingStudent.s.guardian_phone || ''} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Reference</label>
                  <input type="text" name="reference" defaultValue={editingStudent.enrollment.reference || ''} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Course Fee</label>
                    <input type="number" name="course_fee" defaultValue={editingStudent.enrollment.course_fee} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Paid Amount</label>
                    <input type="number" name="paid_amount" defaultValue={editingStudent.enrollment.paid_amount} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Payment Edit Modal */}`;

content = content.replace(paymentModalRegex, studentModal);

fs.writeFileSync('src/components/batches/EnrollmentManager.tsx', content)
console.log("Done")
