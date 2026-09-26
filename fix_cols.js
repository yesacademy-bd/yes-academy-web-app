const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

const missingCols = `
                      <td className="p-4 text-sm">
                        <div className="text-sm font-medium text-gray-900">{m.registered_by || 'Unknown'}</div>
                      </td>
                      <td className="p-4 align-top text-center">
                        {(() => {
                          const isPTE = m.service_type === 'PTE Mock' || m.mock_type === 'PTE Mock';
                          if (!isPTE) return <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-50 rounded">N/A (IELTS)</span>;
                          const report = reports.find((r: any) => r.mock_booking_id === m.id);
                          if (report) {
                            return (
                              <button
                                onClick={() => handleViewReport(report.id)}
                                className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                              >
                                View Report
                              </button>
                            );
                          }
                          return <span className="text-xs text-amber-700 font-medium px-2 py-1 bg-amber-50 rounded border border-amber-200">Not Submitted</span>;
                        })()}
                      </td>
`

// Replace the start of the Actions cell to insert the missing cols before it.
content = content.replace(
  '<td className="p-4 align-middle">',
  missingCols + '                      <td className="p-4 align-middle">'
)

// Also fix the ? character back to ?
content = content.replaceAll('?', '?')
// But wait, there might be other ? characters like in ternary operators? NO!
// Only replace the literal 'Fee: ?' and 'Due: ?' and 'Paid: ?'
content = content.replaceAll('Fee: ?', 'Fee: ?')
content = content.replaceAll('Due: ?', 'Due: ?')
content = content.replaceAll('Paid: ?', 'Paid: ?')

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content, 'utf8')
