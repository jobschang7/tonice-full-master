'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechaincs';
import { dailyReward, friends, iceToken, telegram, tonWallet, twitter, youtube } from '@/images';
import { formatNumber } from '@/utils/ui';
import { earnData } from '@/utils/consts';
import IceCoin from '@/icons/IceCoin';

export default function Airdrop() {
    const { points, incrementPoints } = useGameStore();
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

    const handleTaskComplete = (task: any) => {
        incrementPoints(task.tokens);
        setCompletedTasks(prev => new Set(prev).add(task.title));
    };

    return (
        <div className="bg-black flex justify-center">
            <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px] px-4 py-6 overflow-y-auto">
                        <div className="relative min-h-full pb-20">
                            <div className="flex justify-center mb-4">
                                <Image src={iceToken} alt="Ice Token" width={96} height={96} className="rounded-lg mr-2" />
                            </div>
                            <h1 className="text-2xl text-center mb-4">Airdrop Tasks</h1>
                            <p className="text-gray-300 text-center mb-4 font-normal">Get ready for upcoming tasks! Soon, you'll see a list of challenges below. Complete them to qualify for the Airdrop.</p>
                            <h2 className="text-base mt-8 mb-4">Tasks list</h2>
                            <div
                                className="flex justify-between items-center bg-[#319ee0] rounded-lg p-4 cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <Image src={tonWallet} alt="Ton wallet" width={40} height={40} className="rounded-lg mr-2" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Connect your TON wallet</span>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}