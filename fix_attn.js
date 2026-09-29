const fs = require('fs')
let content = fs.readFileSync('src/components/attendance/AttendanceGrid.tsx', 'utf8')

const targetFn = `  const handleMarkAttendance = async (studentId: string, classNum: number, status: 'Present' | 'Absent' | 'Leave') => {
    // 1. Ensure class session exists
    let session = sessions.find(s => s.class_number === classNum)
    if (!session) {
      // Optimistically create session
      const tempId = \`temp-\${Date.now()}\`
      session = { id: tempId, batch_id: batch.id, class_number: classNum, session_date: new Date().toISOString().split('T')[0] }
      setSessions([...sessions, session])
      
      const res = await createClassSession(batch.id, classNum, session.session_date)
      if (res.success && res.data) {
        session = res.data
        setSessions(prev => prev.map(s => s.class_number === classNum ? session! : s))
      } else {
        alert("Failed to create class session")
        return
      }
    }

    // 2. Optimistic update for record
    const recordIndex = records.findIndex(r => r.student_id === studentId && r.class_session_id === session!.id)
    const newRecord = { 
      id: recordIndex >= 0 ? records[recordIndex].id : \`temp-rec-\${Date.now()}\`,
      student_id: studentId,
      class_session_id: session!.id,
      status
    }
    
    setRecords(prev => {
      const idx = prev.findIndex(r => r.student_id === studentId && r.class_session_id === session!.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = newRecord
        return next
      }
      return [...prev, newRecord]
    })

    startTransition(async () => {
      const result = await markAttendance(batch.id, session!.id, studentId, status)
      if (!result.success) {
        alert(result.message)
        // Rollback optimistic update
        setRecords(records) 
      }
    })
  }`

const replacementFn = `  const handleMarkAttendance = async (studentId: string, classNum: number, status: 'Present' | 'Absent' | 'Leave') => {
    let session = sessions.find(s => s.class_number === classNum);

    // If it's a temporary session from a concurrent click, we need the real one.
    // Calling createClassSession again safely returns the created one via unique violation fallback.
    if (!session || session.id.startsWith('temp-')) {
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Show optimistic session immediately so UI doesn't block entirely, but don't proceed with temp ID
      if (!session) {
        const tempId = \`temp-\${Date.now()}\`;
        setSessions([...sessions, { id: tempId, batch_id: batch.id, class_number: classNum, session_date: todayDate }]);
      }
      
      const res = await createClassSession(batch.id, classNum, todayDate);
      if (res.success && res.data) {
        session = res.data;
        setSessions(prev => {
          // Replace temp or add new
          const filtered = prev.filter(s => s.class_number !== classNum);
          return [...filtered, session!];
        });
      } else {
        alert(res.message || "Failed to create class session");
        // Rollback temp session
        setSessions(prev => prev.filter(s => s.class_number !== classNum));
        return;
      }
    }

    // Now we are guaranteed a REAL session ID from the server
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
        // Rollback on failure (simplified rollback using the prior snapshot wouldn't work with rapid clicks, but we just revert to prior records state)
        setRecords(records);
      }
    });
  }`

// Let's use a simpler replace strategy to avoid regex mismatch.
const regex = /const handleMarkAttendance = async \([\s\S]*?\}\)/;
// Wait, the function ends with `  }` before `  // Calculate attendance % per student`.
// I'll just write a smart replacer.
