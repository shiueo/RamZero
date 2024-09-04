'use client'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { invoke } from '@tauri-apps/api/tauri'
import Link from 'next/link'
import { FaGithub, FaCircleQuestion, FaGear } from 'react-icons/fa6'

export default function Home() {
  const [result, setResult] = useState<string[]>([]) // 로그를 배열로 저장
  const [timerDuration, setTimerDuration] = useState<number>(3600 * 4) // 기본 타이머 값을 60초로 설정
  const [inputDuration, setInputDuration] = useState<number>(3600 * 4) // 입력 필드의 값
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timerDuration,
  )
  const logContainerRef = useRef<HTMLDivElement>(null) // 로그 컨테이너의 참조
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null) // 모달의 열림 상태

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
      }, 1000) // 1초
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
      const errorMsg = `${error}`
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
      const errorMsg = `${error}`
      toast.error(errorMsg)
      setResult((prevResult) => [...prevResult, errorMsg])
    }
  }

  const handleSetTimerDuration = async () => {
    if (inputDuration < 60) {
      toast.error('Timer must be set to at least 60 seconds.')
      return
    }

    setTimerDuration(inputDuration)
    toast.success(`Timer updated to ${formatTime(inputDuration)} seconds.`)
  }

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400) // 1 day = 86400 seconds
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`
  }

  const handleClearLogs = () => {
    setResult([])
    toast.success('Logs cleared.')
  }

  const openModal = (type: string) => {
    setIsModalOpen(type)
  }

  const closeModal = () => {
    setIsModalOpen(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 좌측 상단 아이콘 */}
      <div className="absolute left-4 top-4 z-10 flex items-center justify-center space-x-2 text-xl text-gray-500">
        <Link href="https://github.com/shiueo/WinRamCleaner" target="_tauri">
          <FaGithub className="transition-colors duration-300 hover:text-gray-200" />
        </Link>

        <button onClick={() => openModal('help')}>
          <FaCircleQuestion className="transition-colors duration-300 hover:text-gray-200" />
        </button>
        <button onClick={() => openModal('settings')}>
          <FaGear className="transition-colors duration-300 hover:text-gray-200" />
        </button>
        <p className="text-xs">v 0.0.1</p>
      </div>

      {/* 중앙 내용 */}
      <div className="flex flex-1 flex-col items-center justify-center bg-base-200 px-4 py-4 text-base-content">
        <h1 className="mb-6 text-4xl font-bold">WinRamCleaner</h1>
        <div className="flex w-full max-w-4xl flex-col items-center space-y-4">
          <div className="flex space-x-4">
            <button onClick={handleEnsureRamMap} className="btn btn-primary">
              Install RamMap
            </button>
            <button onClick={handleExecuteCommands} className="btn btn-error">
              Execute Commands
            </button>
          </div>
          <div className="mt-4 text-lg">
            {timeRemaining !== null
              ? `Next cleanup in: ${formatTime(timeRemaining)}`
              : 'Timer not set'}
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <input
              type="number"
              id="timerInput"
              value={inputDuration}
              onChange={(e) => setInputDuration(parseInt(e.target.value))}
              className="input input-bordered input-primary w-32"
              placeholder="(sec)"
            />
            <button
              onClick={handleSetTimerDuration}
              className="btn btn-primary"
            >
              Update Timer
            </button>
          </div>
        </div>
      </div>

      {/* 로그 및 클리어 버튼 */}
      <div className="flex  flex-col">
        <div
          ref={logContainerRef}
          className="w-full flex-1 overflow-y-auto rounded-lg p-4 shadow-md min-h-64"
          style={{ maxHeight: '50vh' }} // 화면 절반 차지하게
        >
          {result.length === 0
            ? 'Logs will appear here...'
            : result.map((log, index) => (
                <p key={index} className="whitespace-pre-wrap">
                  {log}
                </p>
              ))}
        </div>
        <button onClick={handleClearLogs} className="btn btn-warning w-full">
          Clear Logs
        </button>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex w-full items-center justify-center bg-black bg-opacity-70 px-12">
          <div className="w-full max-w-sm rounded-lg bg-base-200 p-4 shadow-lg">
            <div className="max-h-[70vh] overflow-y-auto">
              {isModalOpen === 'help' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold">
                    About WinRamCleaner
                  </h2>
                  <p className="mb-4">
                    WinRamCleaner is a tool designed to optimize and manage your
                    system&apos;s memory usage. With scheduled cleanups and
                    manual commands, you can ensure your system runs smoothly by
                    clearing unnecessary data from the RAM.
                  </p>
                  <h3 className="mb-2 text-lg font-semibold">Features:</h3>
                  <ul className="mb-4 list-inside list-disc space-y-2">
                    <li>Automated memory cleanup at user-defined intervals.</li>
                    <li>Manual execution of RAM cleanup commands.</li>
                    <li>Real-time log display of executed commands.</li>
                  </ul>
                  <h3 className="mb-2 text-lg font-semibold">How to Use:</h3>
                  <p>
                    To get started, set the timer for automatic cleanups or run
                    the commands manually using the buttons on the main screen.
                  </p>
                </div>
              )}
              {isModalOpen === 'settings' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold">Settings</h2>
                  <p className="mb-4">
                    Configure the application settings to suit your preferences.
                    Adjust the timer duration for automated cleanups or change
                    other preferences here.
                  </p>
                  <h3 className="mb-2 text-lg font-semibold">
                    Available Settings:
                  </h3>
                  <ul className="mb-4 list-inside list-disc space-y-2">
                    <li>
                      Timer Duration: Set how frequently the cleanup commands
                      should run automatically.
                    </li>
                    <li>
                      Notification Preferences: Choose how you want to be
                      notified about cleanup events.
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={closeModal}
              className="btn btn-primary mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
