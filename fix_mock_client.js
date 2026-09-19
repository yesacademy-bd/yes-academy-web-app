const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8');

// Replacements

// 1. Spoken Mock removal
code = code.replace(/<option value="Spoken Mock">Spoken Mock<\/option>/g, '');

// 2. Customer Email -> Student Email
code = code.replace(/Customer Email \(Optional\)/g, 'Student Email (Optional)');

// 3. Add Student Type and Mock Status
const nameFieldRegex = /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Student Name<\/label>/;
const topFields = `<div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                <select name="student_type" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="Inhouse">Inhouse</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mock Status</label>
                <select name="mock_status" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="Paid">Paid</option>
                  <option value="Free">Free</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>`;
if (code.match(nameFieldRegex)) {
    code = code.replace(nameFieldRegex, topFields);
}

// 4. Add Registration By
const submitBtnRegex = /<button type="submit" disabled={isSubmitting}/;
const regByField = `<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration By</label>
              <input type="text" disabled value="Automatically recorded based on your login" className="w-full border-gray-300 bg-gray-50 text-gray-500 rounded-md shadow-sm" />
            </div>

            <button type="submit" disabled={isSubmitting}`;
if (code.match(submitBtnRegex)) {
    code = code.replace(submitBtnRegex, regByField);
}

// 5. Add Monthly Mock Slot Summary
const historyRegex = /<div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">/;

// I need to add state for selected month and calculate the summary.
const importRegex = /import { useState } from 'react'/;
code = code.replace(importRegex, `import { useState, useMemo } from 'react'`);

const stateRegex = /const \[mocks\] = useState\(initialMocks\)/;
const newStates = `const [mocks] = useState(initialMocks)
  const [selectedMonthStr, setSelectedMonthStr] = useState(() => {
    const d = new Date();
    return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}\`;
  })

  const slotSummary = useMemo(() => {
    const summary: Record<string, any> = {};
    const [sYear, sMonth] = selectedMonthStr.split('-');
    
    // Process mocks for the selected month
    mocks.forEach(m => {
      const examDateStr = m.exam_date; // YYYY-MM-DD
      if (!examDateStr) return;
      const [y, mm, d] = examDateStr.split('-');
      if (y === sYear && mm === sMonth) {
        if (m.service_type !== 'IELTS Mock' && m.service_type !== 'PTE Mock') return;
        const key = \`\${examDateStr}_\${m.service_type}\`;
        if (!summary[key]) {
          const dateObj = new Date(examDateStr);
          summary[key] = {
            date: examDateStr,
            day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
            mock_type: m.service_type,
            total_slots: 10,
            booked: 0
          };
        }
        summary[key].booked += 1;
      }
    });
    
    const rows = Object.values(summary).sort((a, b) => a.date.localeCompare(b.date));
    let totalSessions = rows.length;
    let totalSlots = totalSessions * 10;
    let totalBooked = rows.reduce((acc, r) => acc + r.booked, 0);
    
    return {
      rows,
      totalSessions,
      totalSlots,
      totalBooked,
      totalRemaining: totalSlots - totalBooked
    };
  }, [mocks, selectedMonthStr])

`;
if (code.match(stateRegex)) {
    code = code.replace(stateRegex, newStates);
}

const summaryUI = `
        {/* Monthly Mock Slot Summary */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Monthly Mock Slot Summary
            </h3>
            <input 
              type="month" 
              value={selectedMonthStr} 
              onChange={e => setSelectedMonthStr(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="p-4 bg-indigo-50/50 border-b border-gray-200 flex flex-wrap gap-6 text-sm">
            <div><span className="text-gray-500">Total Sessions:</span> <span className="font-bold text-gray-900">{slotSummary.totalSessions}</span></div>
            <div><span className="text-gray-500">Total Slots:</span> <span className="font-bold text-gray-900">{slotSummary.totalSlots}</span></div>
            <div><span className="text-gray-500">Total Booked:</span> <span className="font-bold text-gray-900">{slotSummary.totalBooked}</span></div>
            <div><span className="text-gray-500">Total Remaining:</span> <span className="font-bold text-gray-900">{slotSummary.totalRemaining}</span></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Day</th>
                  <th className="p-4">Mock Type</th>
                  <th className="p-4 text-center">Total Slots</th>
                  <th className="p-4 text-center">Booked</th>
                  <th className="p-4 text-center">Remaining</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slotSummary.rows.length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-500">No mock sessions scheduled for this month.</td></tr>
                )}
                {slotSummary.rows.map((row: any, idx: number) => {
                  const remaining = row.total_slots - row.booked;
                  let statusColor = 'bg-blue-100 text-blue-700';
                  let statusText = 'Available';
                  if (remaining === 0) { statusColor = 'bg-red-100 text-red-700'; statusText = 'Full'; }
                  else if (remaining <= 3) { statusColor = 'bg-amber-100 text-amber-700'; statusText = 'Almost Full'; }
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-gray-600">{row.day}</td>
                      <td className="p-4 text-sm text-gray-900">{row.mock_type}</td>
                      <td className="p-4 text-sm text-center">{row.total_slots}</td>
                      <td className="p-4 text-sm text-center font-medium">{row.booked}</td>
                      <td className="p-4 text-sm text-center font-bold text-indigo-600">{remaining}</td>
                      <td className="p-4 text-center">
                        <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColor}\`}>{statusText}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">`;

if (code.match(historyRegex)) {
    code = code.replace(historyRegex, summaryUI);
}

// 6. Update smart slot availability text below exam date.
const examDateRegex = /<input type="date" name="exam_date" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" \/>/;
const newExamDateField = `<input type="date" name="exam_date" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              <p className="text-xs text-gray-500 mt-1">PTE: Sun/Thu | IELTS: Tue. Capacity: 10.</p>`;
if (code.match(examDateRegex)) {
    code = code.replace(examDateRegex, newExamDateField);
}

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', code);
console.log('MockClient.tsx updated successfully');
