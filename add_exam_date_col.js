const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// Add Header
const headerTarget = `<th className="p-4">Exam Details</th>`
const headerReplacement = `<th className="p-4">Exam Details</th>
                    <th className="p-4">Exam Date</th>`
content = content.replace(headerTarget, headerReplacement)

// Add Data Cell
const cellTarget = `                          </div>
                        )}
                        </td>`
const cellReplacement = `                          </div>
                        )}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-800">
                          {m.exam_date ? new Date(m.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>`
content = content.replace(cellTarget, cellReplacement)

// Wait, the colSpan for "No mock services recorded" should also be updated from 7 to 8.
content = content.replace(`<td colSpan={7} className="p-8 text-center text-gray-500">No mock services recorded.</td>`, `<td colSpan={8} className="p-8 text-center text-gray-500">No mock services recorded.</td>`)

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
console.log("Done")
