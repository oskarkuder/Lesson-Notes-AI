import type { User, NoteData } from '../types';

const DB_NAME = 'LessonNotesDB';
const DB_VERSION = 5; // Incremented version for new schema
const NOTES_STORE_NAME = 'notes';
const USERS_STORE_NAME = 'users';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(false);
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;
      
      if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
        const notesStore = db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        notesStore.createIndex('userId', 'userId', { unique: false });
      } else {
        if (transaction) {
          const notesStore = transaction.objectStore(NOTES_STORE_NAME);
          if (!notesStore.indexNames.contains('userId')) {
             notesStore.createIndex('userId', 'userId', { unique: false });
          }
        }
      }
      
      let usersStore;
      if (!db.objectStoreNames.contains(USERS_STORE_NAME)) {
        usersStore = db.createObjectStore(USERS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      } else {
        usersStore = transaction!.objectStore(USERS_STORE_NAME);
      }
      
      if (!usersStore.indexNames.contains('username')) {
        usersStore.createIndex('username', 'username', { unique: true });
      }
      if (!usersStore.indexNames.contains('googleId')) {
        usersStore.createIndex('googleId', 'googleId', { unique: true, sparse: true });
      }
      if (usersStore.indexNames.contains('appleId')) {
        usersStore.deleteIndex('appleId');
      }
    };
  });
};

// User Functions
export const addUser = (username: string, googleId?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USERS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(USERS_STORE_NAME);
        const userToAdd: Omit<User, 'id'> = { 
            username, 
            plan: 'free',
        };
        if (googleId) userToAdd.googleId = googleId;

        const request = store.add(userToAdd);

        request.onsuccess = () => {
            resolve({ ...userToAdd, id: request.result as number });
        };
        request.onerror = () => reject(request.error);
    });
};

export const getUserByGoogleId = (googleId: string): Promise<User | undefined> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USERS_STORE_NAME], 'readonly');
        const store = transaction.objectStore(USERS_STORE_NAME);
        const index = store.index('googleId');
        const request = index.get(googleId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getUserById = (id: number): Promise<User | undefined> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([USERS_STORE_NAME], 'readonly');
        const store = transaction.objectStore(USERS_STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const updateUser = (user: User): Promise<User> => {
     return new Promise((resolve, reject) => {
        const transaction = db.transaction([USERS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(USERS_STORE_NAME);
        const request = store.put(user);
        request.onsuccess = () => {
            resolve(user);
        };
        request.onerror = () => reject(request.error);
    });
};


// Note Functions
export const saveNote = (note: NoteData, audioBlob: Blob): Promise<NoteData> => {
    return new Promise((resolve, reject) => {
        if (!note.userId) return reject(new Error("userId is required to save a note"));
        const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE_NAME);
        
        const noteToStore = {
            ...note,
            audioBlob,
            createdAt: note.createdAt || Date.now()
        };

        const request = note.id ? store.put(noteToStore) : store.add(noteToStore);

        request.onsuccess = () => {
            const savedNote: NoteData = { ...note, id: request.result as number, createdAt: noteToStore.createdAt };
            resolve(savedNote);
        };
        request.onerror = () => {
            console.error('Error saving note:', request.error);
            reject(request.error);
        };
    });
};


export const getAllNotes = (userId: number): Promise<NoteData[]> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
        const store = transaction.objectStore(NOTES_STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
            const notesWithDate = request.result.filter((note: any) => note.createdAt);
            const sortedNotes = notesWithDate.sort((a, b) => b.createdAt - a.createdAt);
            resolve(sortedNotes);
        };
        request.onerror = () => {
            console.error('Error fetching notes:', request.error);
            reject(request.error);
        };
    });
};

export const getNoteWithAudio = (id: number, userId: number): Promise<{ note: NoteData, audioBlob: Blob }> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
        const store = transaction.objectStore(NOTES_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            if (request.result && request.result.userId === userId) {
                const { audioBlob, ...note } = request.result;
                resolve({ note, audioBlob });
            } else {
                reject(new Error("Note not found or access denied."));
            }
        };
        request.onerror = () => {
            console.error('Error fetching note:', request.error);
            reject(request.error);
        };
    });
};


export const deleteNote = (id: number, userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE_NAME);
        
        // First, verify the note belongs to the user before deleting
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            if (getRequest.result && getRequest.result.userId === userId) {
                const deleteRequest = store.delete(id);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            } else {
                reject(new Error("Note not found or permission denied."));
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};