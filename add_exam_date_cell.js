const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// The cell target is right before the Fee / Due column.
const cellTarget = `<td className="p-4 text-sm text-right">
                        <p>Fee: {m.course_fee}</p>`

const cellReplacement = `<td className="p-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                        {m.exam_date ? new Date(m.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="p-4 text-sm text-right">
                        <p>Fee: {m.course_fee}</p>`

content = content.replace(cellTarget, cellReplacement)

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
console.log("Done")
