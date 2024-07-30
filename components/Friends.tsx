'use client'

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IceCubes from '@/icons/IceCubes';
import { ToastContainer, toast } from 'react-toastify';
import { useGameStore } from '@/utils/game-mechaincs';
import { baseGift, bigGift } from '@/images';
import IceCube from '@/icons/IceCube';
import { showErrorMessage, showSuccessMessage } from '@/utils/ui';

interface Referral {
  telegramId: string;
  points: number;
}

export default function Friends() {
  const { userTelegramInitData } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Invite a friend");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const fetchReferrals = useCallback(async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch(`/api/user/referrals?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data.referrals);
      setReferralCount(data.referralCount);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showErrorMessage('Failed to fetch referrals. Please try again later.');
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleInvite = (type: 'regular' | 'premium') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Invitation ${type === 'premium' ? 'with Telegram Premium ' : ''}sent!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
      });
    }, 1000);
  };

  const handleInviteButtonClick = useCallback(() => {
    navigator.clipboard.writeText(`https://t.me/your_bot_username/start?startapp=kentId`)
      .then(() => {
        setButtonText("Link copied");
        showSuccessMessage("Invite link copied to clipboard!");

        setTimeout(() => {
          setButtonText("Invite a friend");
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showErrorMessage("Failed to copy link. Please try again.");
      });
  }, []);

  return (
    <div className="bg-black flex justify-center">
      <ToastContainer />
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px] px-4 py-6 overflow-y-auto">
            <div className="relative min-h-full pb-20">
              <h1 className="text-2xl text-center mb-4">Invite Friends!</h1>
              <p className="text-center text-gray-400 mb-8">You and your friend will receive bonuses</p>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-[#272a2f] rounded-lg p-4" onClick={() => handleInvite('regular')}>
                  <div className="flex items-center">
                    <Image src={baseGift} alt="Gift" width={40} height={40} />
                    <div className="flex flex-col ml-2">
                      <span className="font-medium">Invite a friend</span>
                      <div className="flex items-center">
                        <IceCube className="w-6 h-6" />
                        <span className="ml-1 text-[#f3ba2f]">+5,000 for you and your friend</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#272a2f] rounded-lg p-4" onClick={() => handleInvite('premium')}>
                  <div className="flex items-center">
                    <Image src={bigGift} alt="Premium Gift" width={40} height={40} />
                    <div className="flex flex-col ml-2">
                      <span className="font-medium">Invite a friend with Telegram Premium</span>
                      <div className="flex items-center">
                        <IceCube className="w-6 h-6" />
                        <span className="ml-1 text-[#f3ba2f]">+25,000 for you and your friend</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="#" className="block mt-4 text-center text-blue-500">
                More bonuses
              </Link>

              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg">List of your friends</h2>
                  <svg 
                    className="w-6 h-6 text-gray-400 cursor-pointer" 
                    onClick={fetchReferrals} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="mt-4 bg-[#272a2f] rounded-lg p-4">
                  {isLoadingReferrals ? (
                    // Skeleton loading animation
                    <div className="space-y-2 animate-pulse">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : referrals.length > 0 ? (
                    <ul className="space-y-2">
                      {referrals.map((referral, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>User {referral.telegramId}</span>
                          <span className="text-[#f3ba2f]">{formatNumber(referral.points)} points</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-400">
                      You haven't invited anyone yet
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 mb-14">
                <button 
                  className="w-full py-3 bg-blue-500 rounded-lg text-white font-bold"
                  onClick={handleInviteButtonClick}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}