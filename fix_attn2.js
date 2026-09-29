const fs = require('fs')
let content = fs.readFileSync('src/components/attendance/AttendanceGrid.tsx', 'utf8')

const startString = `  const handleMarkAttendance = async (studentId: string, classNum: number, status: 'Present' | 'Absent' | 'Leave') => {`
const endString = `  // Calculate attendance % per student`

const startIndex = content.indexOf(startString)
const endIndex = content.indexOf(endString)

if (startIndex !== -1 && endIndex !== -1) {
  const replacementFn = `  const handleMarkAttendance = async (studentId: string, classNum: number, status: 'Present' | 'Absent' | 'Leave') => {
    let session = sessions.find(s => s.class_number === classNum);

    if (!session || session.id.startsWith('temp-')) {
      const todayDate = new Date().toISOString().split('T')[0];
      
      if (!session) {
        setSessions(prev => [...prev, { id: \`temp-\${Date.now()}\`, batch_id: batch.id, class_number: classNum, session_date: todayDate }]);
      }
      
      const res = await createClassSession(batch.id, classNum, todayDate);
      if (res.success && res.data) {
        session = res.data;
        setSessions(prev => {
          const filtered = prev.filter(s => s.class_number !== classNum);
          return [...filtered, session];
        });
      } else {
        alert(res.message || "Failed to create class session");
        setSessions(prev => prev.filter(s => s.class_number !== classNum));
        return;
      }
    }

    const realSessionId = session.id;
    const recordIndex = records.findIndex(r => r.student_id === studentId && r.class_session_id === realSessionId);
    const newRecord = { 
      id: recordIndex >= 0 ? records[recordIndex].id : \`temp-rec-\${Date.now()}\`,
      student_id: studentId,
      class_session_id: realSessionId,
      status
    };
    
    setRecords(prev => {
      const idx = prev.findIndex(r => r.student_id === studentId && r.class_session_id === realSessionId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newRecord;
        return next;
      }
      return [...prev, newRecord];
    });

    startTransition(async () => {
      const result = await markAttendance(batch.id, realSessionId, studentId, status);
      if (!result.success) {
        alert(result.message);
        setRecords(records);
      }
    });
  }

`
  content = content.substring(0, startIndex) + replacementFn + content.substring(endIndex)
  fs.writeFileSync('src/components/attendance/AttendanceGrid.tsx', content)
  console.log("Replaced successfully")
} else {
  console.log("Could not find bounds")
}
