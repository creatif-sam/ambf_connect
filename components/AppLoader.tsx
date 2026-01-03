"use client"

import Image from "next/image"

export default function AppLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950"
      role="status"
      aria-label="Application loading"
    >
      <div className="ambf-loader">
        <div className="ambf-loader-ring" />

        <div className="ambf-loader-logo">
          <Image
            src="/icons/logo-ambf.png"
            alt="AMBF Connect"
            width={64}
            height={64}
            priority
          />
        </div>
      </div>
    </div>
  )
}
