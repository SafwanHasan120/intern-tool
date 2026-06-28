import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { ResumeSettings } from './types';

/**
 * Save user's resume to Firestore at users/{uid}/private/resume
 */
export async function saveResumeToFirestore(uid: string, settings: ResumeSettings): Promise<void> {
  try {
    if (!uid) {
      throw new Error('No user UID provided');
    }
    const resumeRef = doc(db, 'users', uid, 'private', 'resume');
    await setDoc(resumeRef, {
      latex: settings.latex,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save resume to Firestore:', { error, uid });
    // Don't throw - just log so app continues to work offline
  }
}

/**
 * Load user's resume from Firestore
 */
export async function loadResumeFromFirestore(uid: string): Promise<ResumeSettings | null> {
  try {
    const resumeRef = doc(db, 'users', uid, 'private', 'resume');
    const docSnap = await getDoc(resumeRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      latex: data.latex || '',
    };
  } catch (error) {
    console.error('Failed to load resume from Firestore:', { error, uid });
    return null;
  }
}

/**
 * Save user's favorites to Firestore at users/{uid}/private/favorites
 */
export async function saveFavoritesToFirestore(uid: string, favorites: Set<string>): Promise<void> {
  try {
    if (!uid) {
      throw new Error('No user UID provided');
    }
    const favoritesRef = doc(db, 'users', uid, 'private', 'favorites');
    await setDoc(favoritesRef, {
      ids: Array.from(favorites),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save favorites to Firestore:', { error, uid });
    // Don't throw - just log so app continues to work offline
  }
}

/**
 * Load user's favorites from Firestore
 */
export async function loadFavoritesFromFirestore(uid: string): Promise<Set<string> | null> {
  try {
    const favoritesRef = doc(db, 'users', uid, 'private', 'favorites');
    const docSnap = await getDoc(favoritesRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return new Set(data.ids || []);
  } catch (error) {
    console.error('Failed to load favorites from Firestore:', error);
    return null;
  }
}
