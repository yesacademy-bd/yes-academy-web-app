'use client'

import { useEffect, useState } from 'react'
import { Activity, MapPin, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export default function LiveOngoingBatches({ batches }: { batches: any[] }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000) // update every minute
    return () => clearInterval(timer)
  }, [])

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = daysOfWeek[currentTime.getDay()]
  
  // Format current time as HH:MM:SS for comparison
  const nowH = currentTime.getHours().toString().padStart(2, '0')
  const nowM = currentTime.getMinutes().toString().padStart(2, '0')
  const nowS = currentTime.getSeconds().toString().padStart(2, '0')
  const nowStr = `${nowH}:${nowM}:${nowS}`

  const ongoingBatches = batches.filter(batch => {
    if (batch.status !== 'Active') return false
    if (!batch.schedule_days.includes(todayName)) return false
    
    // Check if current time is between start and end time
    return nowStr >= batch.start_time && nowStr <= batch.end_time
  })

  if (ongoingBatches.length === 0) return null

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${m} ${ampm}`;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg border-0 overflow-hidden mb-6 text-white p-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
          What is happening right now?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ongoingBatches.map(batch => (
            <Link key={batch.id} href={`/dashboard/faculty/batches/${batch.id}`}>
              <div className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-4 backdrop-blur-sm border border-white/20">
                <h3 className="font-bold text-lg">{batch.batch_name}</h3>
                <div className="text-blue-100 text-sm mt-1">{batch.courses?.name}</div>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-blue-50">
                    <MapPin className="w-4 h-4 text-blue-200" />
                    {batch.rooms?.name || 'Unknown Room'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-50">
                    <Users className="w-4 h-4 text-blue-200" />
                    {batch.profiles?.display_name || 'No Teacher'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-50">
                    <Clock className="w-4 h-4 text-blue-200" />
                    Ends at {formatTime12h(batch.end_time.substring(0,5))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
