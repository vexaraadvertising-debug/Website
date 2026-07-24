export function MaintenanceScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
      <div className="w-24 h-24 mb-8 text-magenta animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a1 1 0 0 1-1.4 0l-2.83-2.83a1 1 0 0 1 0-1.4l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77a1 1 0 0 0 0 1.4z" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-4 text-foreground">
        We'll be right back
      </h1>
      <p className="text-muted-foreground font-medium text-lg">
        We're currently performing some scheduled maintenance to improve your experience. Orinko will be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
}
