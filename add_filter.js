const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

// 1. Add state for historyDateFilter
content = content.replace(
  "const [emailingId, setEmailingId] = useState<string | null>(null)",
  "const [emailingId, setEmailingId] = useState<string | null>(null)\n  const [historyDateFilter, setHistoryDateFilter] = useState('')\n\n  const filteredHistoryMocks = historyDateFilter ? mocks.filter(m => m.exam_date === historyDateFilter) : mocks"
)

// 2. Add Date Input in the Header
const headerRegex = /<div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">\s*<h3 className="font-semibold text-gray-900 flex items-center gap-2">\s*<Calendar className="w-5 h-5 text-gray-500" \/> Mock History\s*<\/h3>\s*<\/div>/;

const newHeader = `<div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" /> Mock History
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Filter by Exam Date:</label>
                <input 
                  type="date" 
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {historyDateFilter && (
                  <button onClick={() => setHistoryDateFilter('')} className="text-xs text-gray-500 hover:text-red-500 underline ml-1">Clear</button>
                )}
              </div>
            </div>`

content = content.replace(headerRegex, newHeader)

// 3. Update mocks.map to filteredHistoryMocks.map
const mapRegex = /\{mocks\.map\(m => \(/;
content = content.replace(mapRegex, `{filteredHistoryMocks.map(m => (`)

const lengthRegex = /\{mocks\.length === 0 && \(/;
content = content.replace(lengthRegex, `{filteredHistoryMocks.length === 0 && (`)

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
console.log("Done")
