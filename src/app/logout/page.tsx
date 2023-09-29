'use client';

import { auth } from '@/firebase-config';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { useAuth } from '../login/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const router = useRouter();
    const { authUser } = useAuth();
    useEffect(() => {
        async function onSignOut() {
            signOut(auth)
        }
        if (authUser) {
            onSignOut();
        } else {
            router.replace('/login')
        }
    })
    return (<>Logging out...</>);
}