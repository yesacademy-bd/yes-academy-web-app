export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <img 
          src="https://tinyurl.com/2z9nfau3" 
          alt="Loading..." 
          className="w-32 h-32 object-contain animate-jump3d drop-shadow-2xl"
        />
      </div>
    </div>
  )
}
