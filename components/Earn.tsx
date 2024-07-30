'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechaincs';
import { capitalizeFirstLetter, formatNumber, showSuccessMessage } from '@/utils/ui';
import { ToastContainer } from 'react-toastify';
import { imageMap } from '@/images';

interface Task {
  id: string;
  title: string;
  description: string;
  tokens: number;
  type: string;
  category: string;
  image: string;
  callToAction: string;
  link: string;
  taskStartTimestamp?: Date;
}

interface TaskPopupProps {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
}

const TaskPopup: React.FC<TaskPopupProps> = ({ task, onClose, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
      onClose();
      showSuccessMessage('Task completed successfully!');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#272a2f] rounded-2xl p-6 max-w-sm w-full">
        <button onClick={onClose} className="float-right text-gray-400 hover:text-white">&times;</button>
        <Image src={imageMap[task.image]} alt={task.title} width={80} height={80} className="mx-auto mb-4" />
        <h2 className="text-3xl text-white text-center font-bold mb-2">{task.title}</h2>
        <p className="text-gray-300 text-center mb-4">{task.description}</p>
        <div className="flex justify-center mb-4">
          <button className="w-fit px-6 py-3 text-xl font-bold bg-blue-500 text-white rounded-2xl">{task.callToAction}</button>
        </div>
        <div className="flex justify-center items-center mb-4">
          <IceCube className="w-6 h-6" />
          <span className="text-white font-bold text-2xl ml-1">+{formatNumber(task.tokens)}</span>
        </div>
        <button
          className="w-full py-6 text-xl font-bold bg-green-500 text-white rounded-2xl flex items-center justify-center"
          onClick={handleCheck}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          ) : (
            'Check'
          )}
        </button>
      </div>
    </div>
  );
};

export default function Earn() {
  const { points, incrementPoints, userTelegramInitData } = useGameStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userTelegramInitData]);

  const handleTaskComplete = (task: Task) => {
    incrementPoints(task.tokens);
    setCompletedTasks((prev) => new Set(prev).add(task.title));
  };

  // Group tasks by type
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.type]) {
      acc[task.type] = [];
    }
    acc[task.type].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="bg-black flex justify-center">
      <ToastContainer />
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px] px-4 py-6 overflow-y-auto">
            <div className="relative min-h-full pb-20">
              <div className="flex justify-center mb-4">
                <IceCube className="w-24 h-24 mx-auto" />
              </div>
              <h1 className="text-2xl text-center mb-4">Earn More Ice</h1>

              {isLoading ? (
                <div className="text-center text-gray-400">Loading tasks...</div>
              ) : (
                Object.entries(groupedTasks).map(([type, tasks]) => (
                  <div key={type}>
                    <h2 className="text-base mt-8 mb-4">{capitalizeFirstLetter(type)}</h2>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center bg-[#272a2f] rounded-lg p-4 cursor-pointer"
                          onClick={() => !completedTasks.has(task.title) && setSelectedTask(task)}
                        >
                          <div className="flex items-center">
                            <Image src={imageMap[task.image]} alt={task.title} width={40} height={40} className="rounded-lg mr-2" />
                            <div className="flex flex-col">
                              <span className="font-medium">{task.title}</span>
                              <div className="flex items-center">
                                <IceCube className="w-6 h-6 mr-1" />
                                <span className="text-white">+{formatNumber(task.tokens)}</span>
                              </div>
                            </div>
                          </div>
                          {completedTasks.has(task.title) ? (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedTask && (
        <TaskPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={() => handleTaskComplete(selectedTask)}
        />
      )}
    </div>
  );
}
