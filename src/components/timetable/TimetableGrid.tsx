'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

export default function TimetableGrid({
  batches,
  rooms,
  isFaculty,
  userId
}: {
  batches: any[]
  rooms: any[]
  isFaculty: boolean
  userId: string
}) {
  const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0])

  // Filter out Completed batches
  const activeBatches = batches.filter(b => b.status === 'Active' || b.status === 'Upcoming')

  // Helper to convert "HH:MM:SS" to a float for easier sorting (e.g. "14:30" -> 14.5)
  const timeToNum = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h + m / 60
  }

  // Helper to convert 24h to 12h format
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${m} ${ampm}`;
  }

  // Get batches for the selected day
  const dayBatches = activeBatches.filter(b => b.schedule_days.includes(selectedDay))

  // Get unique time slots for this specific day across all rooms, sorted
  const timeSlots = Array.from(new Set(dayBatches.map(b => `${b.start_time.substring(0,5)} - ${b.end_time.substring(0,5)}`)))
    .sort((a, b) => {
      const aStart = timeToNum(a.split(' - ')[0])
      const bStart = timeToNum(b.split(' - ')[0])
      return aStart - bStart
    })

  return (
    <div className="space-y-6">
      {/* Day Selector Ribbon */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-sm'
                  : dayBatches.some(b => b.schedule_days.includes(day))
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* The Timetable Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-32 border-r border-gray-200 font-semibold text-gray-700">Time</th>
                {rooms.map(room => (
                  <th key={room.id} className="p-4 min-w-[200px] border-r border-gray-200 last:border-0">
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" /> {room.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {timeSlots.length === 0 ? (
                <tr>
                  <td colSpan={rooms.length + 1} className="p-12 text-center text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    No classes scheduled for {selectedDay}.
                  </td>
                </tr>
              ) : (
                timeSlots.map(slot => {
                  const [start, end] = slot.split(' - ')
                  const start12 = formatTime12h(start)
                  const end12 = formatTime12h(end)
                  
                  return (
                    <tr key={slot} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 border-r border-gray-200 align-top">
                        {start12} <br/> <span className="text-xs text-gray-500 font-normal">to {end12}</span>
                      </td>
                      
                      {rooms.map(room => {
                        // Find if there's a batch in this room at this time slot
                        // Note: Realistically, you'd check for overlapping intervals, but for simplicity, we check exact slot matches
                        const batch = dayBatches.find(b => 
                          b.room_id === room.id && 
                          b.start_time.startsWith(start) && 
                          b.end_time.startsWith(end)
                        )

                        if (!batch) return <td key={room.id} className="p-4 border-r border-gray-200 last:border-0 text-center text-gray-300 text-xs">Available</td>

                        // Highlight if the logged-in faculty is teaching this batch
                        const isMyBatch = isFaculty && (batch.teacher_id === userId || batch.monitor_teacher_id === userId)
                        
                        return (
                          <td key={room.id} className="p-3 border-r border-gray-200 last:border-0 align-top">
                            <div className={`p-3 rounded-lg border ${
                              isMyBatch 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <Link 
                                href={`/dashboard/${isFaculty ? 'faculty' : 'admin'}/batches/${batch.id}`}
                                className="block group"
                              >
                                <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {batch.batch_name}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">{batch.courses?.family} - {batch.courses?.name}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                  <Users className="w-3 h-3" /> {batch.profiles?.display_name}
                                </div>
                                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium 
                                  ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {batch.status}
                                </div>
                              </Link>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
