import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';
import { calculateRestoredEnergy, calculatePointsPerClick, calculateEnergyLimit, calculateMinedPoints } from '@/utils/game-mechaincs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface SyncRequestBody {
  initData: string;
  unsynchronizedPoints: number;
  currentEnergy: number;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

export async function POST(req: Request) {
  try {
    const requestBody: SyncRequestBody = await req.json();
    const { initData: telegramInitData, unsynchronizedPoints, currentEnergy } = requestBody;

    if (!telegramInitData) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { validatedData, user } = validateTelegramWebAppData(telegramInitData);

    if (!validatedData) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
    }

    const telegramId = user.id?.toString();

    if (!telegramId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    if (!unsynchronizedPoints || !currentEnergy || unsynchronizedPoints < 0 || currentEnergy < 0) {
      throw new ValidationError('Invalid input data');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const result = await prisma.$transaction(async (prisma) => {
          const dbUser = await prisma.user.findUnique({
            where: { telegramId },
          });

          if (!dbUser) {
            throw new ValidationError('User not found');
          }

          const maxEnergy = calculateEnergyLimit(dbUser.energyLimitLevelIndex);

          if (currentEnergy > maxEnergy) {
            throw new ValidationError('Invalid energy value');
          }

          const serverTimestamp = Date.now();

          // Calculate restored energy
          const restoredEnergy = calculateRestoredEnergy(dbUser.multitapLevelIndex, dbUser.lastEnergyUpdateTimestamp.getTime(), serverTimestamp);
          const totalPossibleEnergy = Math.max(0, dbUser.energy + restoredEnergy - currentEnergy);

          // Calculate maximum possible points gained
          const pointsPerClick = calculatePointsPerClick(dbUser.multitapLevelIndex);
          const maxPossibleClicks = Math.floor(totalPossibleEnergy / pointsPerClick);
          const maxPossiblePoints = (maxPossibleClicks * pointsPerClick) * 1.2; // 20% buffer for network latency

          // Validate the unsynchronized points
          if (unsynchronizedPoints > maxPossiblePoints) {
            throw new ValidationError('Invalid points calculation');
          }

          const minedPoints = calculateMinedPoints(
            dbUser.mineLevelIndex,
            dbUser.lastPointsUpdateTimestamp.getTime(),
            serverTimestamp
          );

          // Update user data with optimistic locking
          return await prisma.user.update({
            where: { 
              telegramId,
              lastPointsUpdateTimestamp: dbUser.lastPointsUpdateTimestamp, // Optimistic lock
            },
            data: {
              points: { increment: (unsynchronizedPoints + minedPoints) },
              pointsBalance: { increment: (unsynchronizedPoints + minedPoints) },
              energy: currentEnergy,
              lastPointsUpdateTimestamp: new Date(serverTimestamp),
              lastEnergyUpdateTimestamp: new Date(serverTimestamp),
            },
          });
        });

        return NextResponse.json(result);
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2034') {
          // Optimistic locking failed, retry
          retries++;
          if (retries >= MAX_RETRIES) {
            throw new Error('Max retries reached');
          }
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retries))); // Exponential backoff
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error processing user data:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process user data' }, { status: 500 });
  }
}