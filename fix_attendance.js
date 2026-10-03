const fs = require('fs')
let content = fs.readFileSync('src/app/actions/attendance.ts', 'utf8')

const target = `    const { data: allSessions } = await supabase.from('class_sessions')
      .select('class_number, session_date')
      .eq('batch_id', batchId)
      .gt('class_number', 0)
    
    const sessionsArr = allSessions || []
    const sessionToday = sessionsArr.find(s => s.session_date === todayDateStr)
    const highestCompleted = sessionsArr.length > 0 ? Math.max(...sessionsArr.map(s => s.class_number)) : 0
    const allowedClassNum = sessionToday ? sessionToday.class_number : highestCompleted + 1

    if (classNumber > allowedClassNum) {
      throw new Error(\`Cannot create future class session. Expected Class \${allowedClassNum}\`)
    }`

const replacement = `    const { data: allSessions } = await supabase.from('class_sessions')
      .select('class_number, session_date, override_unlock_until')
      .eq('batch_id', batchId)
    
    const sessionsArr = allSessions || []
    const batchSession = sessionsArr.find(s => s.class_number === -1)
    const isBatchUnlocked = batchSession?.override_unlock_until && new Date(batchSession.override_unlock_until).getTime() > Date.now()

    if (!isBatchUnlocked) {
      const realSessions = sessionsArr.filter(s => s.class_number > 0)
      const sessionToday = realSessions.find(s => s.session_date === todayDateStr)
      const highestCompleted = realSessions.length > 0 ? Math.max(...realSessions.map(s => s.class_number)) : 0
      const allowedClassNum = sessionToday ? sessionToday.class_number : highestCompleted + 1

      if (classNumber > allowedClassNum) {
        throw new Error(\`Cannot create future class session. Expected Class \${allowedClassNum}\`)
      }
    }`

content = content.replace(target, replacement)
fs.writeFileSync('src/app/actions/attendance.ts', content)
console.log("Done modifying attendance logic")
