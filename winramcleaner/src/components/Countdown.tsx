import React from 'react'
import { motion } from 'framer-motion'

interface CountdownProps {
  seconds: number // 초 단위로 입력받기
}

export function Countdown({ seconds }: CountdownProps) {
  const getTimeLeft = (seconds: number) => {
    const days = Math.floor(seconds / 86400) // 1 day = 86400 seconds
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return { days, hours, minutes, seconds: remainingSeconds }
  }

  const timeLeft = getTimeLeft(seconds) // 남은 시간 계산

  const timeComponents = Object.keys(timeLeft).map((interval) => (
    <motion.div
      key={interval}
      className="m-2 flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white border-opacity-20 bg-white bg-opacity-10 shadow-lg backdrop-blur-lg backdrop-filter"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="flex h-full w-full flex-col items-center justify-center"
        whileHover={{ y: 0 }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'tween', ease: 'easeOut' }}
      >
        <span className="text-4xl font-bold text-white text-opacity-90">
          {String(timeLeft[interval as keyof typeof timeLeft]).padStart(2, '0')}
        </span>
        <span className="mt-1 text-xs uppercase text-white text-opacity-70">
          {interval}
        </span>
      </motion.div>
    </motion.div>
  ))

  return (
    <div className="flex items-center justify-center">{timeComponents}</div>
  )
}
