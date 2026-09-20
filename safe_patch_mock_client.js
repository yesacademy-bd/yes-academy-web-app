const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8');

// 1. Add updateMockDate to imports
code = code.replace(
  "import { createMockService, deleteMockService, sendConfirmationEmail } from './actions'",
  "import { createMockService, deleteMockService, sendConfirmationEmail, updateMockDate } from './actions'"
);

// 2. Add states
const stateAnchor = "const [isSuccess, setIsSuccess] = useState(false)";
const newStates = `const [isSuccess, setIsSuccess] = useState(false)
  const [mockType, setMockType] = useState('IELTS Mock')
  const [switchModal, setSwitchModal] = useState({isOpen: false, id: '', currentDate: '', studentName: ''})
  const [newDate, setNewDate] = useState('')
  const [isSwitching, setIsSwitching] = useState(false)`;
code = code.replace(stateAnchor, newStates);

// 3. Update Mock Type Select
const mockTypeSelectAnchor = `<select name="mock_type" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="IELTS Mock">IELTS Mock</option>
                <option value="PTE Mock">PTE Mock</option>
              </select>`;
const newMockTypeSelect = `<select name="mock_type" required value={mockType} onChange={e => setMockType(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="IELTS Mock">IELTS Mock</option>
                <option value="PTE Mock">PTE Mock</option>
              </select>
            </div>
            
            {mockType === 'IELTS Mock' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:col-span-3 border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Time</label>
                  <input type="time" name="speaking_time" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Method</label>
                  <select name="speaking_method" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Speaking Teacher</label>
                  <input type="text" name="assigned_speaking_teacher" className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Teacher name" />
                </div>`;
code = code.replace(mockTypeSelectAnchor, newMockTypeSelect);

// 4. Update table headers
const tableHeadersAnchor = `<th className="p-4 text-center">Actions</th>`;
const newTableHeaders = `<th className="p-4 text-left">Registration By</th>
                  <th className="p-4 text-center">Actions</th>`;
code = code.replace(tableHeadersAnchor, newTableHeaders);

// 5. Update table rows
const tableRowsAnchor = `<div className="flex flex-wrap justify-center items-center gap-2">`;
const newTableRowsStart = `</td>
                    <td className="p-4 text-sm text-gray-600">{m.registered_by || 'Unknown'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap justify-center items-center gap-2">`;
code = code.replace(/<\/td>\s*<td className="p-4">\s*<div className="flex flex-wrap justify-center items-center gap-2">/g, newTableRowsStart);

// 6. IELTS details inside Exam Details column
const examDetailsAnchor = `{m.exam_venue && <span>dY"? {m.exam_venue}</span>}
                        </p>
                      )}`;
const newExamDetails = `{m.exam_venue && <span>| {m.exam_venue}</span>}
                        </p>
                      )}
                      {m.service_type === 'IELTS Mock' && (m.speaking_time || m.assigned_speaking_teacher) && (
                        <div className="text-xs text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100">
                          <strong>Speaking:</strong> {m.speaking_time} {m.speaking_method ? \`(\${m.speaking_method})\` : ''} 
                          {m.assigned_speaking_teacher ? \` - \${m.assigned_speaking_teacher}\` : ''}
                        </div>
                      )}`;
code = code.replace(examDetailsAnchor, newExamDetails);
code = code.replace(/<span>dY ' \{m\.exam_time\}<\/span>/g, "<span>{m.exam_time}</span>"); // Fix encoding issue from original file

// 7. Add Switch Date logic
const handleSendEmailAnchor = "const handleSendEmail = async (m: any) => {";
const switchDateHandler = `
  const handleSwitchDate = async () => {
    if (!newDate) return alert('Please select a new date.')
    setIsSwitching(true)
    const res = await updateMockDate(switchModal.id, newDate)
    if (res.success) {
      alert('Date successfully switched!')
      window.location.reload()
    } else {
      alert(res.message || 'Failed to switch date')
      setIsSwitching(false)
    }
  }
`;
code = code.replace(handleSendEmailAnchor, switchDateHandler + '\n  ' + handleSendEmailAnchor);

// 8. Add Switch Date button inside table
const deleteButtonAnchor = `<button
                          onClick={() => handleDelete(m.id)}`;
const switchButton = `<button
                          onClick={() => setSwitchModal({isOpen: true, id: m.id, currentDate: m.exam_date, studentName: m.student_name})}
                          className="inline-flex items-center justify-center p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Switch Date"
                        >
                          <Calendar className="w-5 h-5 shrink-0" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}`;
code = code.replace(new RegExp(deleteButtonAnchor.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), switchButton);

// 9. Add Switch Date Modal
const endOfComponentAnchor = "</div>\n    </div>\n  )\n}";
const switchDateModal = `
      {/* Switch Date Modal */}
      {switchModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-amber-600" /> Switch Mock Date</h3>
            <p className="text-sm text-gray-600 mb-4">
              Student: <strong>{switchModal.studentName}</strong><br/>
              Current Date: {new Date(switchModal.currentDate).toLocaleDateString()}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Exam Date</label>
              <input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSwitchModal({isOpen: false, id: '', currentDate: '', studentName: ''})} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSwitchDate} 
                disabled={isSwitching} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSwitching ? 'Saving...' : 'Confirm Switch Date'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}`;
code = code.replace(endOfComponentAnchor, switchDateModal);

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', code);
console.log('MockClient.tsx successfully rewritten');
