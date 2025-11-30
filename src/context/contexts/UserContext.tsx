'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  role: string | null;
  cost_code: string | null;
  company: string | null;
  tech_admin: boolean | null;
  first_login: boolean | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userCostCode: string | null;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const supabase = createClient();
        
        // Get the current user from auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        console.log('🔐 Auth user data:', { authUser, authError });
        
        if (authError || !authUser) {
          console.log('No authenticated user found');
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user details from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError) {
          console.error('Error fetching user data from users table:', userError);
          
          // Fallback: Get data from auth user's raw_user_meta_data
          if (authUser.user_metadata) {
            const metaData = authUser.user_metadata;
            console.log('📊 Using auth user metadata:', metaData);
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              role: metaData.role || null,
              cost_code: metaData.cost_code || null,
              company: metaData.company || null,
              tech_admin: metaData.tech_admin || false,
              first_login: metaData.first_login || false
            });
          } else {
            console.log('⚠️ No user metadata found, creating basic user object');
            // If no metadata found, create a basic user object
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              role: null,
              cost_code: null,
              company: null,
              tech_admin: false,
              first_login: false
            });
          }
        } else {
          console.log('✅ User data found in users table:', userData);
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            cost_code: userData.cost_code,
            company: userData.company,
            tech_admin: userData.tech_admin,
            first_login: userData.first_login
          });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
              setUser(null);
            } else if (event === 'SIGNED_IN' && session.user) {
              // Re-fetch user data when signed in
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!userError && userData) {
                console.log('✅ User data found in users table (auth change):', userData);
                setUser({
                  id: userData.id,
                  email: userData.email,
                  role: userData.role,
                  cost_code: userData.cost_code,
                  company: userData.company,
                  tech_admin: userData.tech_admin,
                  first_login: userData.first_login
                });
              } else {
                // Fallback: Get data from auth user's metadata
                if (session.user.user_metadata) {
                  const metaData = session.user.user_metadata;
                  console.log('📊 Using auth user metadata (auth change):', metaData);
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: metaData.role || null,
                    cost_code: metaData.cost_code || null,
                    company: metaData.company || null,
                    tech_admin: metaData.tech_admin || false,
                    first_login: metaData.first_login || false
                  });
                }
              }
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const signOut = async () => {
    try {
      console.log('🚪 UserContext: Starting signOut process...');
      
      const supabase = createClient();
      
      // Sign out from Supabase with scope: 'local' to clear local session
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        throw error;
      }
      
      console.log('✅ UserContext: Supabase signOut successful');
      
      // Clear user state immediately
      setUser(null);
      
      // Clear loading state
      setLoading(false);
      
      console.log('✅ UserContext: User state cleared');
      
    } catch (error) {
      console.error('❌ UserContext signOut error:', error);
      
      // Even if there's an error, clear the user state
      setUser(null);
      setLoading(false);
      
      // Re-throw the error so the calling component can handle it
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'energyrite_admin';
  const userCostCode = user?.cost_code || null;

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        userCostCode,
        signOut
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
