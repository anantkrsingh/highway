import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './src/services/authService';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import NotesListScreen from './src/screens/NotesListScreen';
import NoteEditScreen from './src/screens/NoteEditScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  NotesList: { username: string };
  NoteEdit: { noteId: string | null; username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleSwitchAccount = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login">
              {props => (
                <LoginScreen
                  {...props}
                  onLogin={handleLogin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {props => (
                <SignUpScreen
                  {...props}
                  onSignUp={handleLogin}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="NotesList">
              {props => (
                <NotesListScreen
                  {...props}
                  route={{ ...props.route, params: { username: currentUser! } }}
                  onLogout={handleLogout}
                  onSwitchAccount={handleSwitchAccount}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NoteEdit" component={NoteEditScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
