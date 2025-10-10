// Character Store - Learning Data and Mastery
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contentService, progressService } from '@/lib/api';
import type { CharacterState, CharacterMastery, LearningSession, Character, CharacterDifficulty } from '@/types';

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // Initial state
      characters: [],
      currentCharacter: null,
      characterMastery: {},
      currentSession: null,
      sessionHistory: [],
      charactersLearned: [],
      charactersInProgress: [],
      charactersMastered: [],
      selectedType: 'all',
      selectedDifficulty: 'all',
      searchQuery: '',
      isLoading: false,
      isPracticing: false,

      // Load characters
      loadCharacters: async (filters = {}) => {
        set({ isLoading: true });
        try {
          const characters = await contentService.getCharacters(filters);
          set({ characters: characters || [], isLoading: false });
        } catch (error) {
          console.error('Failed to load characters:', error);
          set({ isLoading: false });
        }
      },

      // Set current character
      setCurrentCharacter: (character: Character) => {
        set({ currentCharacter: character });
      },

      // Start learning session
      startLearningSession: (characterId: string) => {
        const session: LearningSession = {
          id: Math.random().toString(36).substr(2, 9),
          characterId,
          startTime: new Date().toISOString(),
          attempts: 0,
          correctAttempts: 0,
          timeSpent: 0,
          completed: false,
        };
        
        set({ currentSession: session, isPracticing: true });
      },

      // End learning session
      endLearningSession: (success: boolean) => {
        const state = get();
        if (!state.currentSession) return;
        
        const session = {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          completed: true,
        };
        
        set({
          currentSession: null,
          isPracticing: false,
          sessionHistory: [...state.sessionHistory, session],
        });
      },

      // Update character mastery
      updateCharacterMastery: async (characterId: string, mastery: number) => {
        try {
          await progressService.updateMastery(characterId, mastery);
          
          set(state => ({
            characterMastery: {
              ...state.characterMastery,
              [characterId]: {
                ...state.characterMastery[characterId],
                mastery,
                lastPracticed: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error('Failed to update character mastery:', error);
        }
      },

      // Practice character
      practiceCharacter: async (characterId: string, success: boolean) => {
        const state = get();
        const currentMastery = state.characterMastery[characterId];
        
        if (!currentMastery) {
          // Initialize mastery for new character
          const character = state.characters.find(c => c.id === characterId);
          if (!character) return;
          
          const newMastery: CharacterMastery = {
            characterId,
            character: character.character,
            type: character.type,
            mastery: success ? 10 : 0,
            attempts: 1,
            correctAttempts: success ? 1 : 0,
            lastPracticed: new Date().toISOString(),
            difficulty: character.difficulty,
            strokeOrder: character.stroke_order,
            readings: character.readings,
            meanings: character.meanings,
          };
          
          set(state => ({
            characterMastery: {
              ...state.characterMastery,
              [characterId]: newMastery,
            },
            charactersLearned: state.charactersLearned.includes(characterId)
              ? state.charactersLearned
              : [...state.charactersLearned, characterId],
          }));
        } else {
          // Update existing mastery
          const newAttempts = currentMastery.attempts + 1;
          const newCorrectAttempts = currentMastery.correctAttempts + (success ? 1 : 0);
          const newMastery = Math.min(100, currentMastery.mastery + (success ? 5 : -2));
          
          set(state => ({
            characterMastery: {
              ...state.characterMastery,
              [characterId]: {
                ...currentMastery,
                mastery: newMastery,
                attempts: newAttempts,
                correctAttempts: newCorrectAttempts,
                lastPracticed: new Date().toISOString(),
              },
            },
            charactersMastered: newMastery >= 80 && !state.charactersMastered.includes(characterId)
              ? [...state.charactersMastered, characterId]
              : state.charactersMastered,
          }));
        }
      },

      // Set character type filter
      setCharacterType: (type: 'all' | 'hiragana' | 'katakana' | 'kanji') => {
        set({ selectedType: type });
      },

      // Set character difficulty filter
      setCharacterDifficulty: (difficulty: 'all' | CharacterDifficulty) => {
        set({ selectedDifficulty: difficulty });
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Get filtered characters
      getFilteredCharacters: () => {
        const state = get();
        let filtered = state.characters;
        
        // Filter by type
        if (state.selectedType !== 'all') {
          filtered = filtered.filter(char => char.type === state.selectedType);
        }
        
        // Filter by difficulty
        if (state.selectedDifficulty !== 'all') {
          const difficultyMap: Record<string, number> = {
            beginner: 1,
            intermediate: 2,
            advanced: 3,
          };
          filtered = filtered.filter(char => char.difficulty === difficultyMap[state.selectedDifficulty]);
        }
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(char =>
            char.character.includes(query) ||
            char.readings.some(reading => reading.toLowerCase().includes(query)) ||
            char.meanings.some(meaning => meaning.toLowerCase().includes(query))
          );
        }
        
        return filtered;
      },

      // Get character mastery
      getCharacterMastery: (characterId: string) => {
        const state = get();
        return state.characterMastery[characterId] || null;
      },

      // Reset character progress
      resetCharacterProgress: () => {
        set({
          characterMastery: {},
          sessionHistory: [],
          charactersLearned: [],
          charactersInProgress: [],
          charactersMastered: [],
          currentSession: null,
        });
      },
    }),
    {
      name: 'character-store',
      partialize: (state) => ({
        characterMastery: state.characterMastery,
        sessionHistory: state.sessionHistory,
        charactersLearned: state.charactersLearned,
        charactersInProgress: state.charactersInProgress,
        charactersMastered: state.charactersMastered,
        selectedType: state.selectedType,
        selectedDifficulty: state.selectedDifficulty,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
