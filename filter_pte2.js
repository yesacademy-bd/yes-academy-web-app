const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/pte-report/PteReportClient.tsx', 'utf8')

const startIndex = content.indexOf('<div className="relative mb-4 max-w-xl">')
const endIndex = content.indexOf('</div>', content.indexOf('<input', startIndex)) + 6

const searchBlockReplacement = `<div className="flex flex-col sm:flex-row gap-4 mb-4 max-w-xl">
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
          <div className="w-full sm:w-[220px] relative">
            <input
              type="date"
              title="Filter by Exam Date"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 text-gray-700 font-medium"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 text-xs font-bold px-2 py-1 rounded bg-gray-100 hover:bg-red-50 transition-colors"
                title="Clear Date Filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>`

content = content.substring(0, startIndex) + searchBlockReplacement + content.substring(endIndex)
fs.writeFileSync('src/app/dashboard/mocks/pte-report/PteReportClient.tsx', content)
