import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { notesService, Note } from '../services/notesService';
import AccountSwitchModal from '../components/AccountSwitchModal';

interface NotesListScreenProps {
  navigation: any;
  route: {
    params: {
      username: string;
    };
  };
  onLogout: () => void;
  onSwitchAccount: (username: string) => void;
}

type SortOption = 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';

const NotesListScreen: React.FC<NotesListScreenProps> = ({
  navigation,
  route,
  onLogout,
  onSwitchAccount,
}) => {
  const { username } = route.params;
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');
  const [refreshing, setRefreshing] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const loadNotes = async () => {
    try {
      const userNotes = await notesService.getNotes(username);
      setNotes(userNotes);
      applyFiltersAndSort(userNotes, searchQuery, sortOption);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    }
  };

  useEffect(() => {
    loadNotes();
  }, [username]);

  useEffect(() => {
    applyFiltersAndSort(notes, searchQuery, sortOption);
  }, [searchQuery, sortOption]);

  const applyFiltersAndSort = (
    notesToFilter: Note[],
    query: string,
    sort: SortOption,
  ) => {
    let filtered = notesToFilter;
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = notesToFilter.filter(
        note =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.body.toLowerCase().includes(lowerQuery),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'updated-desc':
          return b.updatedAt - a.updatedAt;
        case 'updated-asc':
          return a.updatedAt - b.updatedAt;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredNotes(sorted);
  };

  const handleDelete = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.deleteNote(username, noteId);
            loadNotes();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, []);

  const renderNote = ({ item }: { item: Note }) => {
    const preview = item.body.length > 100 ? item.body.substring(0, 100) + '...' : item.body;

    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => navigation.navigate('NoteEdit', { noteId: item.id, username })}
      >
        <View style={styles.noteContent}>
          {item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          )}
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.notePreview}>{preview}</Text>
            <Text style={styles.noteDate}>
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowAccountModal(true)}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AccountSwitchModal
        visible={showAccountModal}
        currentUsername={username}
        onClose={() => setShowAccountModal(false)}
        onSwitchAccount={onSwitchAccount}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === 'updated-desc' && styles.sortButtonActive,
          ]}
          onPress={() => setSortOption('updated-desc')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === 'updated-desc' && styles.sortButtonTextActive,
            ]}
          >
            Newest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === 'updated-asc' && styles.sortButtonActive,
          ]}
          onPress={() => setSortOption('updated-asc')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === 'updated-asc' && styles.sortButtonTextActive,
            ]}
          >
            Oldest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === 'title-asc' && styles.sortButtonActive,
          ]}
          onPress={() => setSortOption('title-asc')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === 'title-asc' && styles.sortButtonTextActive,
            ]}
          >
            A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === 'title-desc' && styles.sortButtonActive,
          ]}
          onPress={() => setSortOption('title-desc')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === 'title-desc' && styles.sortButtonTextActive,
            ]}
          >
            Z-A
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NoteEdit', { noteId: null, username })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 24,
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sortLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#666',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteContent: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  noteText: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    marginTop: 10,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default NotesListScreen;

