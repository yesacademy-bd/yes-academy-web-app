const fs = require('fs')
let content = fs.readFileSync('src/components/batches/FacultyBatchList.tsx', 'utf8')

const regex = /<div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md mt-1">\s*<BookOpen className="w-3.5 h-3.5 text-blue-500" \/>\s*Current Class: \{Math.max\(0, \.\.\.\(batch.class_sessions\?.filter\(\(s: any\) => s.class_number > 0\).map\(\(s: any\) => s.class_number\) \|\| \[0\]\)\)\}s*<\/div>/g

const replacement = `<div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Current Class: {Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0]))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 w-fit px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Remaining: {Math.max(0, (batch.total_classes || 0) + (batch.additional_classes || 0) - Math.max(0, ...(batch.class_sessions?.filter((s: any) => s.class_number > 0).map((s: any) => s.class_number) || [0])))}
                    </div>
                  </div>`

// Wait, the regex might be tricky. Let's just find the start of the block and replace the whole block carefully.
// A simpler replace using split or substring based on exact known strings:

const startStr = '<div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5 \r\npy-1 rounded-md mt-1">'
// Since the file has Windows \r\n we need to be careful with template strings!

const targetRegex = /<div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 w-fit px-2.5[\s\S]*?<\/div>/g

content = content.replace(targetRegex, replacement)

fs.writeFileSync('src/components/batches/FacultyBatchList.tsx', content)
console.log("Done regex replace")
