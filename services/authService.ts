import * as db from './dbService';
import type { User } from '../types';

const SESSION_STORAGE_KEY = 'lessonNotesAiUser';

// This interface represents the decoded JWT payload from Google
export interface GoogleJwtPayload {
    sub: string; // The user's unique Google ID
    email: string;
    name: string;
}

export const handleGoogleSignIn = async (payload: GoogleJwtPayload): Promise<User> => {
    // Check if user exists by googleId
    const existingUser = await db.getUserByGoogleId(payload.sub);
    if (existingUser) {
        return existingUser;
    }

    // A more robust implementation might check for an existing user by email
    // and offer to link the accounts. For this demo, we'll create a new user.
    
    // Use email as username, no password needed for Google sign-in
    const newUser = await db.addUser(payload.email, payload.sub);
    return newUser;
};

export const updateUserPlan = async (userId: number, plan: 'pro'): Promise<User> => {
    const userRecord = await db.getUserById(userId);
    if (!userRecord) {
        throw new Error("User not found");
    }
    const updatedUserRecord = { ...userRecord, plan };
    const updatedUser = await db.updateUser(updatedUserRecord);
    setCurrentUserSession(updatedUser); // Update the session as well
    return updatedUser;
};

export const setCurrentUserSession = (user: User): void => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export const getCurrentUserSession = (): User | null => {
    const userJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
};

export const clearCurrentUserSession = (): void => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};