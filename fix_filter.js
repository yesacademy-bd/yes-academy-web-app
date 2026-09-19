const fs = require('fs');
let code = fs.readFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', 'utf8');

// Add refundAmount state
if (!code.includes('const [refundAmount, setRefundAmount] = useState<number | string>(0)')) {
    code = code.replace(
        "const [remarks, setRemarks] = useState('')",
        "const [remarks, setRemarks] = useState('')\n  const [refundAmount, setRefundAmount] = useState<number | string>(0)"
    );
}

// Update handleCancel
const oldCancelFunc = `const handleCancel = async () => {
    if (!remarks) return alert("Remarks are required")
    const res = await cancelEnrollment(cancelling.id, remarks, cancelling.batch_id)
    if (res.success) {
      setCancelling(null)
      setRemarks('')
      handleSearch()
    } else alert(res.message)
  }`;

const newCancelFunc = `const handleCancel = async () => {
    if (!remarks) return alert("Remarks are required")
    const res = await cancelEnrollment(cancelling.id, remarks, cancelling.batch_id, Number(refundAmount) || 0, cancelling.students?.name || 'Unknown')
    if (res.success) {
      setCancelling(null)
      setRemarks('')
      setRefundAmount(0)
      handleSearch()
    } else alert(res.message)
  }`;

if (code.includes(oldCancelFunc)) {
    code = code.replace(oldCancelFunc, newCancelFunc);
}

// UI Replacement for Cancel Modal
const oldUI = `<label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Remarks</label>
                <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for cancellation..." required></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => {setCancelling(null); setRemarks('');}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Close</button>
                <button onClick={handleCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Confirm Cancel</button>`;

const newUI = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Remarks</label>
                    <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="Reason for cancellation..." required></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (Optional)</label>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="0" />
                    <p className="text-xs text-gray-500 mt-1">This will be deducted from CRM as a refund expense.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => {setCancelling(null); setRemarks(''); setRefundAmount(0);}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Close</button>
                <button onClick={handleCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Confirm Cancel</button>`;

if (code.includes(oldUI)) {
    code = code.replace(oldUI, newUI);
} else {
    console.log("Could not find old UI block");
}

fs.writeFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', code);
console.log("Updated StudentDatabaseFilter");
