const fs = require('fs')

function makeResponsive(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Replace large paddings properly with word boundaries
  content = content.replace(/\bp-6\b/g, 'p-4 sm:p-6')
  content = content.replace(/\bp-8\b/g, 'p-4 sm:p-8')
  content = content.replace(/\bp-12\b/g, 'p-6 sm:p-12')
  
  // Replace fixed grids with responsive grids
  content = content.replace(/className="grid grid-cols-2 gap-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-4')
  content = content.replace(/className="grid grid-cols-2 gap-y-5 gap-x-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4')
  content = content.replace(/className="grid grid-cols-2 md:grid-cols-3 gap-4/g, 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4')
  
  // Ensure table wrappers have w-full
  content = content.replace(/className="overflow-x-auto"/g, 'className="overflow-x-auto w-full"')
  content = content.replace(/className="overflow-x-auto mb-8"/g, 'className="overflow-x-auto w-full mb-8"')
  
  // Add min-w-0 to flex/grid items to prevent blowout
  content = content.replace(/className="md:col-span-3/g, 'className="md:col-span-3 min-w-0')
  content = content.replace(/className="space-y-6"/g, 'className="space-y-6 min-w-0 w-full"')
  
  // Clean up any double replacements if they somehow existed
  content = content.replace(/p-4 sm:p-4 sm:p-6/g, 'p-4 sm:p-6')
  
  fs.writeFileSync(filePath, content)
}

makeResponsive('src/app/dashboard/mocks/MockClient.tsx')
makeResponsive('src/app/dashboard/mocks/pte-report/PteReportClient.tsx')

console.log("Done making responsive safely")
