export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center animate-jump3d drop-shadow-2xl">
        <div className="flex items-center bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-100">
           <div className="text-[#be1e2d] font-bold text-5xl italic mr-2" style={{ fontFamily: 'sans-serif' }}>YES</div>
           <div className="text-[#1e2a5c] font-bold text-xl tracking-[0.2em] mt-3" style={{ fontFamily: 'sans-serif' }}>ACADEMY</div>
        </div>
      </div>
    </div>
  )
}
