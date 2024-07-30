// components/PointSynchronizer.tsx
'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';
import { showErrorMessage, showSuccessMessage } from '@/utils/ui';

export function PointSynchronizer() {
    const {
        userTelegramInitData,
        energy,
        unsynchronizedPoints,
        lastClickTimestamp,
        initializeState
    } = useGameStore();

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const syncWithServer = useCallback(async () => {
        if (unsynchronizedPoints < 1) return;
        const frozenPointsToSynchronized = unsynchronizedPoints;
        showSuccessMessage(`Trying to synchronize ${frozenPointsToSynchronized}`);

        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                    unsynchronizedPoints: unsynchronizedPoints,
                    currentEnergy: energy,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to sync with server');
            }

            const data = await response.json();
            console.log("Data from server: ", data);
            const updatedUnsynchronizedPoints = Math.max(0, unsynchronizedPoints - frozenPointsToSynchronized);

            // initializeState({
            //     points: data.points,
            //     pointsBalance: data.pointsBalance,
            //     energy: data.energy,
            //     unsynchronizedPoints: updatedUnsynchronizedPoints,
            // });
            showSuccessMessage(`Successfully synchronized! New points to synchronize: ${updatedUnsynchronizedPoints}`);
        } catch (error) {
            showErrorMessage('Error syncing with server:');
            console.error('Error syncing with server:', error);
        }
    }, [userTelegramInitData, unsynchronizedPoints, energy, initializeState]);

    useEffect(() => {
        // Clear any existing timeout
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        console.log("unsynchronizedPoints", unsynchronizedPoints);
        // Set a new timeout
        syncTimeoutRef.current = setTimeout(() => {
            if (unsynchronizedPoints > 1) {
                syncWithServer();
            }
        }, 2000);

        // Cleanup function
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [lastClickTimestamp, unsynchronizedPoints, syncWithServer]);

    return null;
}