import { auth } from '@/firebase-config';
import { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthUserContext {
    authUser: User | null;
    loading: boolean;
}

function useFirebaseAuth() {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const authStateChange = async (authState: any) => {
        if (!authState) {
            setAuthUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const formattedUser = authState;
        setAuthUser(formattedUser);
        setLoading(false);
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(authStateChange);
        return () => unsubscribe();
    }, []);

    return {
        authUser,
        loading,
    };
}

const authUserContext = createContext<AuthUserContext>({
    authUser: null,
    loading: true,
});

export function AuthUserProvider({ children }: any) {
    const auth = useFirebaseAuth();
    return <authUserContext.Provider value={auth}>{ children }</authUserContext.Provider>
}

export const useAuth = () => useContext(authUserContext);
