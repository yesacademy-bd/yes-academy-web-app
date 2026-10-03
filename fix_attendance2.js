const fs = require('fs')
let content = fs.readFileSync('src/app/actions/attendance.ts', 'utf8')

const target = `    const sessionsArr = allSessions || []
    const batchSession = sessionsArr.find(s => s.class_number === -1)
    const isBatchUnlocked = batchSession?.override_unlock_until && new Date(batchSession.override_unlock_until).getTime() > Date.now()

    if (!isBatchUnlocked) {`

const replacement = `    const sessionsArr = allSessions || []
    const batchSession = sessionsArr.find(s => s.class_number === -1)
    const isBatchUnlocked = batchSession?.override_unlock_until && new Date(batchSession.override_unlock_until).getTime() > Date.now()
    const thisSession = sessionsArr.find(s => s.class_number === classNumber)
    const isSessionUnlocked = thisSession?.override_unlock_until && new Date(thisSession.override_unlock_until).getTime() > Date.now()

    if (!isBatchUnlocked && !isSessionUnlocked) {`

content = content.replace(target, replacement)
fs.writeFileSync('src/app/actions/attendance.ts', content)
console.log("Done checking session unlock as well")
