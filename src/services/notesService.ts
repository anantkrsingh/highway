import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  body: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
}

const getNotesKey = (username: string) => `@notes_${username}`;

export const notesService = {
  async getNotes(username: string): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(getNotesKey(username));
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      return [];
    }
  },

  async getNote(username: string, noteId: string): Promise<Note | null> {
    try {
      const notes = await this.getNotes(username);
      return notes.find(note => note.id === noteId) || null;
    } catch (error) {
      return null;
    }
  },

  async createNote(username: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const notes = await this.getNotes(username);
      const newNote: Note = {
        ...note,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      notes.push(newNote);
      await AsyncStorage.setItem(getNotesKey(username), JSON.stringify(notes));
      return newNote;
    } catch (error) {
      throw new Error('Failed to create note');
    }
  },

  async updateNote(username: string, noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> {
    try {
      const notes = await this.getNotes(username);
      const index = notes.findIndex(note => note.id === noteId);

      if (index === -1) {
        throw new Error('Note not found');
      }

      notes[index] = {
        ...notes[index],
        ...updates,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(getNotesKey(username), JSON.stringify(notes));
      return notes[index];
    } catch (error) {
      throw new Error('Failed to update note');
    }
  },

  async deleteNote(username: string, noteId: string): Promise<void> {
    try {
      const notes = await this.getNotes(username);
      const filteredNotes = notes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem(getNotesKey(username), JSON.stringify(filteredNotes));
    } catch (error) {
      throw new Error('Failed to delete note');
    }
  },
};

