const fs = require('fs');
let code = fs.readFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', 'utf8');

const regex = /<label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Remarks<\/label>[\s\S]*?Confirm Cancel<\/button>\s*<\/div>/;

const newUI = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Remarks</label>
                    <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for cancellation..." required></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (Optional)</label>
                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="0" />
                    <p className="text-xs text-gray-500 mt-1">Will be deducted from CRM as a refund expense.</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={() => {setCancelling(null); setRemarks(''); setRefundAmount(0);}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Close</button>
                  <button onClick={handleCancel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Confirm Cancel</button>
                </div>`;

code = code.replace(regex, newUI);
fs.writeFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', code);
