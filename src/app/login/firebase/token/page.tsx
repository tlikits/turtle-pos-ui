'use client';

import { auth } from '@/firebase-config';
import { signInWithCustomToken } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';


export default function FirebaseLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            signInWithCustomToken(auth, token)
                .then(credentail => {
                    router.replace('/')
                })
                .catch(error => {
                    console.error('Error on login with firebase custom token', error.message);
                    router.replace('/login');
                });
        }
    })
    return (<>Logging In...</>);
}