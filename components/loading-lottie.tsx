"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

interface LoadingLottieProps {
  size?: number
}

export function LoadingLottie({ size = 120 }: LoadingLottieProps) {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <DotLottieReact
        src="/lotties/Loading.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  )
}
