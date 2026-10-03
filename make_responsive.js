const fs = require('fs')

function makeResponsive(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Replace large paddings
  content = content.replace(/p-6/g, 'p-4 sm:p-6')
  content = content.replace(/p-8/g, 'p-4 sm:p-8')
  content = content.replace(/p-12/g, 'p-6 sm:p-12')
  
  // Ensure table wrappers have w-full
  content = content.replace(/className="overflow-x-auto"/g, 'className="overflow-x-auto w-full"')
  content = content.replace(/className="overflow-x-auto mb-8"/g, 'className="overflow-x-auto w-full mb-8"')
  
  // Add min-w-0 to flex/grid items to prevent blowout
  content = content.replace(/className="md:col-span-3/g, 'className="md:col-span-3 min-w-0')
  content = content.replace(/className="space-y-6"/g, 'className="space-y-6 min-w-0 w-full"')
  
  fs.writeFileSync(filePath, content)
}

makeResponsive('src/app/dashboard/mocks/MockClient.tsx')
makeResponsive('src/app/dashboard/mocks/pte-report/PteReportClient.tsx')

console.log("Done making responsive")
