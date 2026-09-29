const fs = require('fs')
let content = fs.readFileSync('src/components/batches/FacultyBatchList.tsx', 'utf8')

const regex = /<Users className="w-4 h-4 text-gray-400" \/>\s*Room: \{batch\.rooms\?\.name\}\s*\{isHR && batch\.profiles\?\.display_name && `[^`]+`\}\s*<\/div>/

const replacement = `<Users className="w-4 h-4 text-gray-400" />
                  Room: {batch.rooms?.name}
                  {isHR && batch.profiles?.display_name && \` • Teacher: \${batch.profiles?.display_name}\`}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md mt-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  Current Class: {Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0]))}
                </div>`

if (regex.test(content)) {
  content = content.replace(regex, replacement)
  fs.writeFileSync('src/components/batches/FacultyBatchList.tsx', content)
  console.log("Replaced successfully")
} else {
  console.log("Could not find match")
}
