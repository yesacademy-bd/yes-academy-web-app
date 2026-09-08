import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function PrintLeaveRequest({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: req } = await supabase.from('leave_requests').select('*').eq('id', params.id).single()
  
  if (!req) return notFound()

  return (
    <div className="bg-white min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 15mm; }
          #sidebar, #topbar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}} />
      <div className="max-w-[210mm] mx-auto bg-white p-8 text-black font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1e2a5c]">Leave Request Form</h1>
          <div className="text-right flex items-center">
             <div className="text-[#be1e2d] font-bold text-3xl italic mr-1">YES</div>
             <div className="text-[#1e2a5c] font-bold text-sm tracking-widest mt-3">ACADEMY</div>
          </div>
        </div>

        {/* How to submit */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            How to submit a leave request
          </div>
          <div className="p-3 text-sm">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Fill out the leave request form with accurate details.</li>
              <li>Submit the form to your Direct Manager/Head of Business for approval.</li>
              <li>Once approved, Management will verify and process the request.</li>
              <li>Scan the approved copy and send over mail to supervisor by keeping CEO Sir in CC</li>
            </ol>
          </div>
        </div>

        {/* Employee details */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Employee details
          </div>
          <div className="grid grid-cols-2 divide-x border-t border-[#1e2a5c]">
            <div className="flex divide-x border-b border-[#1e2a5c]">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Employee name</div>
              <div className="w-2/3 p-2 text-sm">{req.employee_name}</div>
            </div>
            <div className="flex divide-x border-b border-[#1e2a5c]">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Department</div>
              <div className="w-2/3 p-2 text-sm">{req.department}</div>
            </div>
            <div className="flex divide-x">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Job title</div>
              <div className="w-2/3 p-2 text-sm">{req.job_title}</div>
            </div>
            <div className="flex divide-x">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Staff ID</div>
              <div className="w-2/3 p-2 text-sm">{req.staff_id}</div>
            </div>
          </div>
        </div>

        {/* Leave request details */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Leave request details
          </div>
          <div className="flex flex-col border-t border-[#1e2a5c] divide-y">
            <div className="flex divide-x">
              <div className="w-1/4 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Leave request</div>
              <div className="w-3/4 p-2 text-sm flex gap-8 justify-center">
                <span>{req.leave_type === 'Days' ? '☒' : '☐'} Days</span>
                <span>{req.leave_type === 'Half Day' ? '☒' : '☐'} Half Day</span>
                <span>{req.leave_type === 'Hours' ? '☒' : '☐'} Hours</span>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x border-b border-[#1e2a5c]">
              <div className="flex divide-x">
                <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Starting Date</div>
                <div className="w-1/2 p-2 text-sm">{new Date(req.starting_on).toLocaleDateString('en-GB')}</div>
              </div>
              {req.leave_type === 'Days' && (
                <div className="flex divide-x">
                  <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Ending Date</div>
                  <div className="w-1/2 p-2 text-sm">{new Date(req.ending_on).toLocaleDateString('en-GB')}</div>
                </div>
              )}
            </div>
            {(req.leave_type === 'Half Day' || req.leave_type === 'Hours') && (
              <div className="grid grid-cols-2 divide-x">
                <div className="flex divide-x">
                  <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Start Time</div>
                  <div className="w-1/2 p-2 text-sm">{req.start_time?.slice(0, 5) || ''}</div>
                </div>
                <div className="flex divide-x">
                  <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">End Time</div>
                  <div className="w-1/2 p-2 text-sm">{req.end_time?.slice(0, 5) || ''}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Reason for leave request
          </div>
          <div className="grid grid-cols-3 p-3 gap-2 text-sm border-t border-[#1e2a5c]">
            <div>{req.reason === 'Casual' ? '☒' : '☐'} Casual</div>
            <div>{req.reason === 'Family Reasons' ? '☒' : '☐'} Family Reasons</div>
            <div>{req.reason === 'Emergency' ? '☒' : '☐'} Emergency</div>
            <div>{req.reason === 'Funeral/Bereavement' ? '☒' : '☐'} Funeral/Bereavement</div>
            <div>{req.reason === 'Medical Leave' ? '☒' : '☐'} Medical Leave</div>
            <div>{req.reason === 'Other' ? '☒' : '☐'} Other: {req.reason === 'Other' ? req.other_reason : ''}</div>
          </div>
        </div>

        {/* Declaration */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            I confirm that the information provided in this leave request form is accurate and complete.<br/>
            I understand that this request is subject to approval by my employer
          </div>
          <div className="flex flex-col border-t border-[#1e2a5c] divide-y">
            <div className="flex divide-x">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Employee signature</div>
              <div className="w-2/3 p-2 font-serif italic">{req.employee_signature}</div>
            </div>
            <div className="flex divide-x">
              <div className="w-1/3 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Date</div>
              <div className="w-2/3 p-2 text-sm">{new Date(req.employee_signature_date).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="border border-[#1e2a5c] mb-6 min-h-[60px] flex flex-col">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Give short explanation on the selected reasons for leave
          </div>
          <div className="p-2 text-sm flex-1 border-t border-[#1e2a5c]">
            {req.explanation}
          </div>
        </div>

        {/* Management decision */}
        <div className="border border-[#1e2a5c] mb-6">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Management decision
          </div>
          <div className="flex flex-col border-t border-[#1e2a5c] divide-y">
            <div className="grid grid-cols-2 divide-x">
              <div className="p-2 text-sm flex gap-8 justify-center">
                <span>{req.status === 'Approved' ? '☒' : '☐'} Approved</span>
                <span>{req.status === 'Rejected' ? '☒' : '☐'} Rejected</span>
              </div>
              <div className="p-2 text-sm flex gap-8 justify-center">
                <span>{req.payment_status === 'Paid' ? '☒' : '☐'} Paid</span>
                <span>{req.payment_status === 'Unpaid' ? '☒' : '☐'} Unpaid</span>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="flex divide-x">
                <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Manager signature</div>
                <div className="w-1/2 p-2 font-serif italic">{req.manager_signature}</div>
              </div>
              <div className="flex divide-x">
                <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Signature of<br/>Head of Business</div>
                <div className="w-1/2 p-2 font-serif italic flex items-center">{req.hob_signature}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x">
              <div className="flex divide-x">
                <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Date</div>
                <div className="w-1/2 p-2 text-sm">{req.decision_date ? new Date(req.decision_date).toLocaleDateString('en-GB') : ''}</div>
              </div>
              <div className="flex divide-x">
                <div className="w-1/2 bg-[#d4f0fa] p-2 text-sm font-bold text-[#1e2a5c]">Date</div>
                <div className="w-1/2 p-2 text-sm">{req.decision_date ? new Date(req.decision_date).toLocaleDateString('en-GB') : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager notes */}
        <div className="border border-[#1e2a5c] min-h-[60px] flex flex-col">
          <div className="bg-[#1e2a5c] text-white font-bold p-2 text-sm">
            Notes and comments of the Manager/Head of Business
          </div>
          <div className="p-2 text-sm flex-1 border-t border-[#1e2a5c]">
            {req.manager_notes}
          </div>
        </div>

        {/* Script to trigger print automatically */}
        <script dangerouslySetInnerHTML={{__html: 'window.onload = function() { window.print(); }'}} />
      </div>
    </div>
  )
}
