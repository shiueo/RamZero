'use client'
import { useState, useEffect } from 'react'
import { Github, HelpCircle, User, Settings } from 'lucide-react'
import { invoke } from '@tauri-apps/api/tauri'
import Link from 'next/link'
import { Modal } from '@/components/Modal'
import { Countdown } from '@/components/Countdown'
import { Button } from '@/components/Button'
import TimerInput from '@/components/TimerInput'

export default function Home() {
  const [status, setStatus] = useState('')
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [timerDuration, setTimerDuration] = useState<number>(3600 * 4) // 기본 타이머 값을 4시간
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timerDuration,
  )

  const checkRamMapExists = async () => {
    try {
      const exists = await invoke<boolean>('check_rammap_exists')
      if (exists) {
        setStatus('RamMap already exist.')
      } else {
        setStatus(
          'RamMap not exist > 설정 아이콘을 눌러 RamMap을 설치해주세요.',
        )
        // UI 업데이트 로직 추가 가능 (예: RamMap이 없음을 알림)
      }
    } catch (error) {
      console.error('Error checking RamMap existence:', error)
      // 에러 처리
    }
  }

  useEffect(() => {
    checkRamMapExists()
  }, [])

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

  const handleEnsureRamMap = async () => {
    try {
      const response = await invoke<string>('ensure_rammap')
      setStatus(response)
    } catch (error) {
      const errorMsg = `${error}`
      setStatus(errorMsg)
    }
  }

  const handleExecuteCommands = async () => {
    try {
      const response = await invoke<string>('execute_rammap_commands')
      setStatus(response)
    } catch (error) {
      const errorMsg = `${error}`
      setStatus(errorMsg)
    }
  }

  const handleSetTimerDuration = async (inputDuration: number) => {
    if (inputDuration < 60) {
      setStatus('Timer must be set to at least 60 seconds.')
      return
    }

    setTimerDuration(inputDuration)
    setStatus(`Timer updated to ${formatTime(inputDuration)} seconds.`)
  }

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400) // 1 day = 86400 seconds
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-black/20 to-white/20">
      {/* 좌측 상단 아이콘  / Github / Help / Settings */}
      <div className="absolute left-4 top-4 flex space-x-4">
        <button
          onClick={() => setShowGithubModal(true)}
          className="text-white opacity-70 transition-opacity hover:opacity-100"
        >
          <Github size={24} />
        </button>

        <button
          onClick={() => setShowHelpModal(true)}
          className="text-white opacity-70 transition-opacity hover:opacity-100"
        >
          <HelpCircle size={24} />
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="text-white opacity-70 transition-opacity hover:opacity-100"
        >
          <Settings size={24} />
        </button>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center text-white opacity-70">
        <User size={18} className="mr-2" />
        <span className="text-sm">
          Made with ♥ by{' '}
          <Link href="https://shiueo.xyz" target="_tauri" className="underline">
            shiüo
          </Link>
        </span>
      </div>

      {/* 중앙 내용 */}

      <div className="relative z-10">
        <div className="flex max-w-sm flex-wrap justify-center">
          <Countdown seconds={timeRemaining ?? 0} />
          <Button onClick={handleExecuteCommands} className="mt-4 w-full">
            Clean Ram Immediately
          </Button>
          <p className="mt-1 text-sm opacity-70">{status}</p>
        </div>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={showGithubModal}
        onClose={() => setShowGithubModal(false)}
        title="GitHub Repository"
      >
        <p className="text-white">
          This project is open source. You can find the code and contribute on
          GitHub.
        </p>
        <Link href="https://github.com/shiueo/WinRamCleaner" target="_tauri">
          <p className="mt-4 underline">View on GitHub</p>
        </Link>
      </Modal>

      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="About WinRamCleaner"
      >
        <p className="mb-4">
          WinRamCleaner is a tool designed to optimize and manage your
          system&apos;s memory usage. With scheduled cleanups and manual
          commands, you can ensure your system runs smoothly by clearing
          unnecessary data from the RAM.
        </p>
        <h3 className="mb-2 text-lg font-semibold">Features:</h3>
        <ul className="mb-4 list-inside list-disc space-y-2">
          <li>Automated memory cleanup at user-defined intervals.</li>
          <li>Manual execution of RAM cleanup commands.</li>
          <li>Real-time log display of executed commands.</li>
        </ul>
        <h3 className="mb-2 text-lg font-semibold">How to Use:</h3>
        <p>
          To get started, set the timer for automatic cleanups or run the
          commands manually using the Buttons on the main screen.
        </p>
      </Modal>

      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Settings"
      >
        <p className="mb-4">
          Configure the application settings to suit your preferences. Adjust
          the timer duration for automated cleanups or change other preferences
          here.
        </p>
        <hr />
        <TimerInput onUpdateTimer={handleSetTimerDuration} />
        <Button
          className="mt-4 w-full rounded-sm !bg-emerald-400 !ring-emerald-400"
          onClick={handleEnsureRamMap}
        >
          Reinstall RamMap
        </Button>
      </Modal>
    </div>
  )
}
