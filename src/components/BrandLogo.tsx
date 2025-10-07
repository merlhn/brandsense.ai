export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="4" fill="#FFFFFF" />
        {/* Binoculars/Telescope Icon */}
        <circle cx="8.5" cy="12" r="2.5" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
        <circle cx="15.5" cy="12" r="2.5" stroke="#0A0A0A" strokeWidth="1.5" fill="none" />
        <path d="M11 12H13" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 9.5V8" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15.5 9.5V8" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-foreground tracking-tight">
        Brand<span className="font-semibold">Sense</span>
      </span>
    </div>
  );
}