import { db } from './firebase';
import { doc, getDoc, runTransaction, Timestamp } from 'firebase/firestore';

const DAILY_LIMIT = 5;

export interface RateLimitStatus {
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: number;
}

function getTodayKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime();
}

export async function checkRateLimit(uid: string): Promise<RateLimitStatus> {
  try {
    const today = getTodayKey();
    const docRef = doc(db, 'tailorUsage', uid, 'days', today);
    const docSnap = await getDoc(docRef);

    const count = docSnap.exists() ? (docSnap.data().count as number) : 0;
    const allowed = count < DAILY_LIMIT;
    const resetsAt = allowed ? getMidnightUTC() : getMidnightUTC();

    return {
      allowed,
      used: count,
      limit: DAILY_LIMIT,
      resetsAt,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    throw error;
  }
}

export async function incrementUsage(uid: string): Promise<void> {
  try {
    const today = getTodayKey();
    const docRef = doc(db, 'tailorUsage', uid, 'days', today);

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      const currentCount = docSnap.exists() ? (docSnap.data().count as number) : 0;
      transaction.set(docRef, { count: currentCount + 1, updatedAt: Timestamp.now() });
    });
  } catch (error) {
    console.error('Usage increment failed:', error);
    throw error;
  }
}
