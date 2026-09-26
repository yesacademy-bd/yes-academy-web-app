const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/pte-report/PteReportClient.tsx', 'utf8')

// 1. Add selectedDate state
const searchStateRegex = /const \[searchQuery, setSearchQuery\] = useState\(''\)/
const searchStateReplace = `const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    const offset = d.getTimezoneOffset()
    d.setMinutes(d.getMinutes() - offset)
    return d.toISOString().split('T')[0]
  })`
content = content.replace(searchStateRegex, searchStateReplace)

// 2. Add filter logic
const filterRegex = /const filteredBookings = initialBookings\.filter\(b => \{\n\s*if \(\!searchQuery\) return true/
const filterReplace = `const filteredBookings = initialBookings.filter(b => {
    if (selectedDate && b.exam_date !== selectedDate) return false
    if (!searchQuery) return true`
content = content.replace(filterRegex, filterReplace)

// 3. Replace Search Input UI
const searchBlockToReplace = `          <div className="relative mb-4 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
              placeholder="Search by Name, Email, Phone, or Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>`

const searchBlockReplacement = `          <div className="flex flex-col sm:flex-row gap-4 mb-4 max-w-xl">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                placeholder="Search by Name, Email, Phone, or Batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48 relative">
              <input
                type="date"
                title="Filter by Exam Date"
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-700"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-medium px-2"
                  title="Clear Date Filter"
                >
                  Clear
                </button>
              )}
            </div>
          </div>`

content = content.replace(searchBlockToReplace, searchBlockReplacement)
fs.writeFileSync('src/app/dashboard/mocks/pte-report/PteReportClient.tsx', content)
