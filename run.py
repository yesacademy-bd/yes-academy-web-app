import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Top Stats div completely with the new Stitch design
old_jsx_pattern = r'\{\/\* Top Stats \*\/\}.*?(?=<div className="grid grid-cols-1 lg:grid-cols-3)'
new_jsx = """{/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Activity className="w-5 h-5" /></div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Batches</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-extrabold text-gray-900">{activeBatches.length}</p>
            <p className="text-sm font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">+12% this week</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-5 h-5" /></div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Classes Today</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-extrabold text-gray-900">{todaysBatches.length}</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-5 h-5" /></div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming Batches</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-extrabold text-gray-900">{upcomingBatches.length}</p>
            <p className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">Requires Planning</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-lg border border-red-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Missed Attendance</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-extrabold text-red-600">{missedAttendanceBatches.length}</p>
          </div>
        </div>
      </div>
      
      """

new_content = re.sub(old_jsx_pattern, new_jsx, content, flags=re.DOTALL)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
