'use client'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { invoke } from '@tauri-apps/api/tauri'

export default function Home() {
  const [result, setResult] = useState<string[]>([]) // 로그를 배열로 저장
  const [timerDuration, setTimerDuration] = useState<number>(60) // 기본 타이머 값을 60초로 설정
  const [inputDuration, setInputDuration] = useState<number>(60) // 입력 필드의 값
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timerDuration,
  )
  const logContainerRef = useRef<HTMLDivElement>(null) // 로그 컨테이너의 참조

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const startTimer = () => {
      setTimeRemaining(timerDuration)
      if (interval) clearInterval(interval)

      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            // 타이머가 만료되면 명령어를 호출
            handleExecuteCommands()
            return timerDuration // 타이머를 다시 설정
          }
          return prev - 1
        })
      }, 1000) // 매초마다 업데이트
    }

    startTimer() // 타이머 시작

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerDuration])

  useEffect(() => {
    // 로그가 업데이트될 때마다 스크롤을 맨 아래로 이동
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [result])

  const handleEnsureRamMap = async () => {
    try {
      const response = await invoke<string>('ensure_rammap')
      toast.success(response)
      setResult((prevResult) => [...prevResult, response])
    } catch (error) {
      const errorMsg = `Error: ${error}`
      toast.error(errorMsg)
      setResult((prevResult) => [...prevResult, errorMsg])
    }
  }

  const handleExecuteCommands = async () => {
    toast.success('Executing commands...')
    try {
      const response = await invoke<string>('execute_rammap_commands')
      setResult((prevResult) => [...prevResult, response])
    } catch (error) {
      const errorMsg = `Error: ${error}`
      toast.error(errorMsg)
      setResult((prevResult) => [...prevResult, errorMsg])
    }
  }

  const handleSetTimerDuration = async () => {
    if (inputDuration < 60) {
      toast.error('Timer duration must be at least 60 seconds.')
      return
    }

    setTimerDuration(inputDuration)
    toast.success(`Timer set to ${inputDuration} seconds.`)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 flex-1 flex flex-col items-center justify-center bg-base-200 py-4 text-base-content">
        <h1 className="mb-6 text-4xl font-bold">WinRamCleaner</h1>
        <div className="flex flex-col items-center space-y-4 w-full max-w-4xl">
          <div className="flex space-x-4">
            <button onClick={handleEnsureRamMap} className="btn btn-primary">
              Ensure RamMap
            </button>
            <button onClick={handleExecuteCommands} className="btn btn-success">
              Execute Commands
            </button>
          </div>
          <div className="text-lg mt-4">
            {timeRemaining !== null
              ? `Time remaining: ${formatTime(timeRemaining)}`
              : 'Timer not set'}
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <label htmlFor="timerInput" className="text-lg">
              Set Timer (seconds):
            </label>
            <input
              type="number"
              id="timerInput"
              value={inputDuration}
              onChange={(e) => setInputDuration(parseInt(e.target.value))}
              className="input input-bordered input-primary w-32"
            />
            <button onClick={handleSetTimerDuration} className="btn btn-accent">
              Set Timer
            </button>
          </div>
        </div>
      </div>
      <div
        ref={logContainerRef}
        className="flex-1 w-full max-w-4xl overflow-y-auto rounded-lg border border-base-300 bg-base-100 p-4 shadow-md"
      >
        {result.length === 0
          ? 'Command output will appear here...'
          : result.map((log, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {log}
              </p>
            ))}
      </div>
    </div>
  )
}
