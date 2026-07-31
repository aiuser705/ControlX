'use client';

export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
      <video
        src="/videos/Create_a_second_cinematic_e.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-85"
      />
    </div>
  );
}
