import { useState, useEffect } from 'react';
import { Customer } from '../types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) {
        setIsLoading(false);
        return;
      }
      
      const parsedUser = JSON.parse(savedUser);
      // Always ensure favorites array exists
      if (!Array.isArray(parsedUser.favorites)) {
        parsedUser.favorites = [];
        localStorage.setItem('currentUser', JSON.stringify(parsedUser));
      }
      setCurrentUser(parsedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: Customer) => {
    // Always ensure favorites array exists
    if (!Array.isArray(user.favorites)) {
      user = { ...user, favorites: [] };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    isAdmin: currentUser?.isAdmin === true
  };
}