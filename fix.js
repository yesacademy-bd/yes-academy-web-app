const fs = require('fs')

let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// 1. Fix Switch Modal Cancel Button
const toReplaceSwitch = `
            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                                        <button
                            onClick={() => setEditModal({ isOpen: true, mock: m })}
                            className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Mock Service"
                          >
                            <Edit className="w-5 h-5 shrink-0" />
                          </button>
                          <button 
                onClick={() => setSwitchModal({isOpen: false, id: '', currentDate: '', studentName: '', mockType: ''})} `
const replacementSwitch = `
            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setSwitchModal({isOpen: false, id: '', currentDate: '', studentName: '', mockType: ''})} `
content = content.replace(toReplaceSwitch, replacementSwitch)

// 2. Fix Actions Layout
const toReplaceActions = content.substring(content.indexOf('<td className="p-4 align-top">'), content.indexOf('</tr>', content.indexOf('<td className="p-4 align-top">')))
const replacementActions = `                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-2 items-center justify-center max-w-[140px] mx-auto">
                        <div className="flex gap-1.5 p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => handleSendEmail(m)}
                            disabled={!m.email || emailingId === m.id}
                            className={\`inline-flex items-center justify-center p-1.5 rounded-md transition-colors \${!m.email ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-sky-100 text-sky-600 hover:bg-sky-200 disabled:opacity-50'}\`}
                            title={m.email ? "Send Confirmation Email" : "No email address provided"}
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </button>
                          <a
                            href={\`https://wa.me/\${formatPhone(m.phone)}?text=\${encodeURIComponent(\`Hello \${m.student_name}, this is a confirmation for your \${m.service_type || m.mock_type}. Your exam is scheduled on \${new Date(m.exam_date).toLocaleDateString()}\${m.exam_time ? \` at \${m.exam_time}\` : ''}\${m.exam_venue ? \` at \${m.exam_venue}\` : ''}. Fee: ?\${m.course_fee}, Paid: ?\${m.paid_amount || 0}, Due: ?\${m.due_amount}.\`)}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            title="Send WhatsApp Confirmation"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.183-.573c.978.582 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.765-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/></svg>
                          </a>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-gray-50/50 rounded-lg border border-gray-100">
                          <button
                            onClick={() => setEditModal({ isOpen: true, mock: m })}
                            className="inline-flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
                            title="Edit Mock Service"
                          >
                            <Edit className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => setSwitchModal({isOpen: true, id: m.id, currentDate: m.exam_date, studentName: m.student_name, mockType: m.service_type || m.mock_type})}
                            className="inline-flex items-center justify-center p-1.5 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200 transition-colors"
                            title="Switch Date"
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="inline-flex items-center justify-center p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Mock Service"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </td>
`

content = content.replace(toReplaceActions, replacementActions)

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
