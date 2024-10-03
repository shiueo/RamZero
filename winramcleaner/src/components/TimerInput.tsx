import React, { useState, useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from './Button'

interface TimerInputProps {
  onUpdateTimer: (totalSeconds: number) => void
}

const TimerInput: React.FC<TimerInputProps> = ({ onUpdateTimer }) => {
  const [days, setDays] = useState<number>(0)
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [seconds, setSeconds] = useState<number>(0)
  const [editingField, setEditingField] = useState<string | null>(null)

  const daysRef = useRef<HTMLInputElement>(null)
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const secondsRef = useRef<HTMLInputElement>(null)

  const handleIncrement = (
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    max: number,
  ) => {
    setValue((prevValue) => (prevValue + 1) % (max + 1))
  }

  const handleDecrement = (
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    max: number,
  ) => {
    setValue((prevValue) => (prevValue - 1 + (max + 1)) % (max + 1))
  }

  const handleFocus = (
    field: string,
    setValue: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setEditingField(field)
    setValue(0) // Focus될 때 값을 0으로 설정
  }

  const handleBlur = () => {
    setEditingField(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    max: number,
  ) => {
    let value = parseInt(e.target.value, 10)
    if (isNaN(value)) {
      value = 0
    } else if (value > max) {
      value = max
    }
    setValue(value)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      ref.current?.blur()
    }
  }

  const renderField = (
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    max: number,
    label: string,
    ref: React.RefObject<HTMLInputElement>,
  ) => (
    <div className="flex flex-col items-center">
      <button
        onClick={() => handleIncrement(value, setValue, max)}
        className="rounded p-1 text-white"
      >
        <ChevronUp size={20} />
      </button>
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={
            editingField === label ? value : value.toString().padStart(2, '0')
          }
          onChange={(e) => handleChange(e, setValue, max)}
          onFocus={() => handleFocus(label, setValue)}
          onBlur={handleBlur}
          onKeyDown={(e) => handleKeyDown(e, ref)}
          className="w-24 rounded px-4 py-2 text-center text-2xl font-bold text-white"
        />
      </div>
      <button
        onClick={() => handleDecrement(value, setValue, max)}
        className="rounded p-1 text-white"
      >
        <ChevronDown size={20} />
      </button>
      <span className="mt-1 text-sm">{label}</span>
    </div>
  )

  const calculateTotalSeconds = () => {
    const totalSeconds =
      days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
    return totalSeconds
  }

  const handleUpdateClick = () => {
    const totalSeconds = calculateTotalSeconds()
    onUpdateTimer(totalSeconds) // 전체 시간 초로 반환
  }

  return (
    <>
      <div className="flex flex-col items-center rounded-lg p-4">
        <div className="flex w-full justify-between">
          {renderField(days, setDays, 99, 'Days', daysRef)}
          {renderField(hours, setHours, 23, 'Hours', hoursRef)}
          {renderField(minutes, setMinutes, 59, 'Minutes', minutesRef)}
          {renderField(seconds, setSeconds, 59, 'Seconds', secondsRef)}
        </div>
      </div>
      <Button className="w-full rounded-sm" onClick={handleUpdateClick}>
        Update Timer
      </Button>
    </>
  )
}

export default TimerInput
