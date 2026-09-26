const fs = require('fs')

let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// The Edit Modal HTML
const editModalHtml = \
      {/* Edit Mock Modal */}
      {editModal.isOpen && editModal.mock && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-4xl w-full border border-gray-300 relative overflow-hidden" style={{ opacity: 1, isolation: 'isolate' }}>
            
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Mock Service
              </h2>
              <button onClick={() => setEditModal({ isOpen: false, mock: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form id="editMockForm" onSubmit={handleEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                      <select name="student_type" required defaultValue={editModal.mock.student_type} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="Inhouse">Inhouse</option>
                        <option value="External">External</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mock Status</label>
                      <select name="mock_status" required defaultValue={editModal.mock.mock_status} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="Paid">Paid</option>
                        <option value="Free">Free</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input type="text" name="student_name" required defaultValue={editModal.mock.student_name} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input type="text" name="batch_number" defaultValue={editModal.mock.batch_number || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phone" required defaultValue={editModal.mock.phone} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required defaultValue={editModal.mock.email} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (Amount)</label>
                    <input type="number" name="amount" defaultValue={editModal.mock.course_fee} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                    <input type="number" name="paid_amount" defaultValue={editModal.mock.paid_amount} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mock Type</label>
                    <select name="mock_type" required defaultValue={editModal.mock.service_type || editModal.mock.mock_type} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="IELTS Mock">IELTS Mock</option>
                      <option value="PTE Mock">PTE Mock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input type="date" name="exam_date" required defaultValue={editModal.mock.exam_date} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Time</label>
                    <input type="text" name="exam_time" defaultValue={editModal.mock.exam_time || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Venue</label>
                    <input type="text" name="exam_venue" defaultValue={editModal.mock.exam_venue || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Time (IELTS)</label>
                    <input type="text" name="speaking_time" defaultValue={editModal.mock.speaking_time || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Method (IELTS)</label>
                    <input type="text" name="speaking_method" defaultValue={editModal.mock.speaking_method || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Teacher (IELTS)</label>
                    <input type="text" name="assigned_speaking_teacher" defaultValue={editModal.mock.assigned_speaking_teacher || ''} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditModal({ isOpen: false, mock: null })} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="submit" form="editMockForm" disabled={isEditing} className="px-5 py-2.5 bg-blue-600 border border-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm">
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
\

content = content.replace('{/* Switch Date Modal */}', editModalHtml + '\n\n      {/* Switch Date Modal */}')

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
