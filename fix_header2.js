const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8')

const regex = /<div className="flex items-center gap-2">[\s\S]*?<label className="text-sm text-gray-600 font-medium">Filter by Exam Date:<\/label>[\s\S]*?<input [\s\S]*?className="px-3 py-1\.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"\s*\/>\s*\{historyDateFilter && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>/

const replacement = `<div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">Type:</label>
                    <select
                      value={historyTypeFilter}
                      onChange={(e) => setHistoryTypeFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="All">All Types</option>
                      <option value="IELTS Mock">IELTS Mock</option>
                      <option value="PTE Mock">PTE Mock</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">Date:</label>
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

if (regex.test(content)) {
  content = content.replace(regex, replacement)
  fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', content)
  console.log("Replaced successfully")
} else {
  console.log("Regex did not match")
}
