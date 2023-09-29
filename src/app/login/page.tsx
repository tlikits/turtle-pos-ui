'use client';

import Link from 'next/link';
import AuthGuard from '../../guards/auth-guard';
import s from './page.module.css';
import { getLineAuthorizeUrl } from './utils';

export default function LoginPage() {
    function renderLineLoginButton() {
        const url = getLineAuthorizeUrl();
        return (
            <>
                <Link href={ url } className={`${s['login-option']} ${s['login-option--line']}`}>
                    <div className={s['login-option__icon']}></div>
                    <div className={s['login-option__text']}>Log in with LINE</div>
                </Link>
            </>
        )
    }

    return (
        <AuthGuard>
            <h1 className={`page-header ${s['page-header--login']}`}>เข้าสู่ระบบ</h1>
            <div className={s['login-options']}>
                { renderLineLoginButton() }
            </div>
        </AuthGuard>
    )
}
