const fs = require('fs')
let content = fs.readFileSync('src/components/batches/FacultyBatchList.tsx', 'utf8')

// Add state & filter
const stateTarget = `  const [statusTab, setStatusTab] = useState<'Active' | 'Upcoming' | 'Completed'>('Active')`
const stateReplacement = `  const [statusTab, setStatusTab] = useState<'Active' | 'Upcoming' | 'Completed'>('Active')
  const [dayFilter, setDayFilter] = useState('')`

content = content.replace(stateTarget, stateReplacement)

const filterTarget = `    const matchesTeacher = teacherFilter ? batch.profiles?.display_name === teacherFilter : true
    const matchesStatus = batch.status === statusTab
    return matchesSearch && matchesTeacher && matchesStatus`
const filterReplacement = `    const matchesTeacher = teacherFilter ? batch.profiles?.display_name === teacherFilter : true
    const matchesStatus = batch.status === statusTab
    const matchesDay = dayFilter ? batch.schedule_days?.includes(dayFilter) : true
    return matchesSearch && matchesTeacher && matchesStatus && matchesDay`

content = content.replace(filterTarget, filterReplacement)

// Add filter UI
const uiTarget = `          {isHR && (
            <select`
const uiReplacement = `          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Days</option>
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
          
          {isHR && (
            <select`

content = content.replace(uiTarget, uiReplacement)

// Add Remaining Class Count
const currentTarget = `                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md mt-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Current Class: {Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0]))}
                  </div>`

const currentReplacement = `                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Current Class: {Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0]))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 w-fit px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Remaining: {Math.max(0, (batch.total_classes || 0) + (batch.additional_classes || 0) - Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0])))}
                    </div>
                  </div>`

content = content.replace(currentTarget, currentReplacement)

fs.writeFileSync('src/components/batches/FacultyBatchList.tsx', content)
console.log("Done updating FacultyBatchList.tsx")
