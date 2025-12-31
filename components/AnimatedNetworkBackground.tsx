"use client"

export default function AnimatedNetworkBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="network-layer">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="network-node" />
        ))}
      </div>
    </div>
  )
}
