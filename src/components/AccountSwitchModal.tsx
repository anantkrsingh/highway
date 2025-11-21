import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authService } from '../services/authService';

interface AccountSwitchModalProps {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
  onSwitchAccount: (username: string) => void;
}

const AccountSwitchModal: React.FC<AccountSwitchModalProps> = ({
  visible,
  currentUsername,
  onClose,
  onSwitchAccount,
}) => {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (visible) {
      loadUsers();
      setSelectedUsername(null);
      setPassword('');
    }
  }, [visible]);

  const loadUsers = async () => {
    const allUsers = await authService.getAllUsers();
    setUsers(allUsers);
  };

  const handleSelectUser = (username: string) => {
    if (username === currentUsername) {
      Alert.alert('Info', 'You are already logged in as this user');
      return;
    }
    setSelectedUsername(username);
    setPassword('');
  };

  const handleSwitchAccount = async () => {
    if (!selectedUsername) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    const isValid = await authService.verifyPassword(selectedUsername, password);
    if (!isValid) {
      Alert.alert('Error', 'Invalid password');
      setPassword('');
      return;
    }

    await authService.switchUser(selectedUsername);
    onSwitchAccount(selectedUsername);
    onClose();
  };

  const renderUserItem = ({ item }: { item: string }) => {
    const isCurrentUser = item === currentUsername;
    const isSelected = item === selectedUsername;

    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isSelected && styles.userItemSelected,
          isCurrentUser && styles.userItemCurrent,
        ]}
        onPress={() => handleSelectUser(item)}
      >
        <Text style={[styles.userItemText, isCurrentUser && styles.userItemTextCurrent]}>
          {item} {isCurrentUser && '(Current)'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Account</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.usersListContainer}>
            <Text style={styles.sectionTitle}>Select an account:</Text>
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={item => item}
              style={styles.usersList}
            />
          </View>

          {selectedUsername && (
            <View style={styles.passwordContainer}>
              <Text style={styles.passwordLabel}>
                Enter password for {selectedUsername}:
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleSwitchAccount}
              >
                <Text style={styles.switchButtonText}>Switch Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  usersListContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  usersList: {
    maxHeight: 250,
  },
  userItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  userItemCurrent: {
    backgroundColor: '#e8f5e9',
  },
  userItemText: {
    fontSize: 16,
    color: '#333',
  },
  userItemTextCurrent: {
    fontWeight: '600',
  },
  passwordContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  passwordLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountSwitchModal;

