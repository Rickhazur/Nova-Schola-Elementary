
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Language, UserLevel, ViewState } from '../types';
import { supabase } from '../services/supabase';
import { logError } from '../utils/errorHandler';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppUser {
    uid: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    level: UserLevel;
}

interface AppState {
    user: AppUser | null;
    language: Language;
    currentView: ViewState;
    /** True while the initial session check is in flight */
    isSessionLoading: boolean;
    error: string | null;
}

type AppAction =
    | { type: 'SET_USER'; payload: AppUser }
    | { type: 'CLEAR_USER' }
    | { type: 'SET_LANGUAGE'; payload: Language }
    | { type: 'SET_VIEW'; payload: ViewState }
    | { type: 'SESSION_LOADED' }
    | { type: 'SET_ERROR'; payload: string | null };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState: AppState = {
    user: null,
    language: 'es',
    currentView: ViewState.DASHBOARD,
    isSessionLoading: true,
    error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, isSessionLoading: false, error: null };
        case 'CLEAR_USER':
            return { ...state, user: null, currentView: ViewState.DASHBOARD };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload };
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'SESSION_LOADED':
            return { ...state, isSessionLoading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isSessionLoading: false };
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        if (!supabase) {
            dispatch({ type: 'SESSION_LOADED' });
            return;
        }

        // Restore existing session on mount
        supabase.auth.getSession()
            .then(({ data }) => {
                if (data.session?.user) {
                    const u = data.session.user;
                    dispatch({
                        type: 'SET_USER',
                        payload: {
                            uid: u.id,
                            name: u.user_metadata?.name || u.email?.split('@')[0] || '',
                            email: u.email || '',
                            role: u.user_metadata?.role || 'STUDENT',
                            level: u.user_metadata?.level || 'primary',
                        },
                    });
                } else {
                    dispatch({ type: 'SESSION_LOADED' });
                }
            })
            .catch((err) => {
                logError(err, 'AppContext/getSession');
                dispatch({ type: 'SESSION_LOADED' });
            });

        // Keep session in sync (e.g. token expiry, sign-out from another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                dispatch({ type: 'CLEAR_USER' });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppContext(): AppContextValue {
    const ctx = useContext(AppContext);
    if (!ctx) {
        throw new Error('useAppContext must be used within <AppProvider>');
    }
    return ctx;
}
