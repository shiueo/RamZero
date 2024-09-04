'use client'
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Home() {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');

  const handleEnsureRamMap = async () => {
    setStatus('Checking for RamMap...');
    try {
      const response = await invoke<string>('ensure_rammap');
      setStatus(response);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleExecuteCommands = async () => {
    setStatus('Executing commands...');
    try {
      const response = await invoke<string>('execute_rammap_commands');
      setResult(response);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold">WinRamCleaner</h1>
      <button
        onClick={handleEnsureRamMap}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Ensure RamMap
      </button>
      <button
        onClick={handleExecuteCommands}
        className="px-4 py-2 mt-4 text-white bg-green-500 rounded hover:bg-green-600"
      >
        Execute Commands
      </button>
      <p className="mt-4">{status}</p>
      <div className="p-4 mt-4 bg-gray-100 text-black rounded w-full max-w-2xl">
        {result || 'Command output will appear here...'}
      </div>
    </div>
  );
}
