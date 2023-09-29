'use client'

import { useAuth } from '@/app/login/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LOGIN_URL = '/login';
const DEFAULT_URL = '/orders';

export default function AuthGuard({
    children,
}: {
    children: React.ReactNode,
}) {
    const router = useRouter();
    const pathname = usePathname();

    const { authUser, loading } = useAuth();
    const [isShowContent, setIsShowContent] = useState(false);

    useEffect(() => {
        authCheck();
    });

    function authCheck() {
        if (loading) {
            return;
        }
        if (pathname !== LOGIN_URL) {
            return redirectToLogInPageIfNotAuth();
        }
        return redirectToHomePageIfAuth();
    }

    function redirectToLogInPageIfNotAuth() {
        if (authUser === null) {
            setIsShowContent(false);
            return router.push(LOGIN_URL);
        }
        setIsShowContent(true);
    }

    function redirectToHomePageIfAuth() {
        if (authUser !== null) {
            setIsShowContent(false);
            return router.push(DEFAULT_URL);
        }
        setIsShowContent(true);
    }

    return isShowContent && children;
}
