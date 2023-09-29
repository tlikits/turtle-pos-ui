'use client';

import { AuthUserProvider, useAuth } from '../../app/login/contexts/auth-context';
import BurgerMenu, { NavItem } from '../burger-menu/burger-menu';



const DEFAULT_NAV_CONFIG: NavItem[] = [
    {
        name: 'รายการออเดอร์',
        link: '/orders',
    },
    {
        name: 'รายการอาหาร',
        link: '/kitchen',
    },
    {
        name: 'รายการอาหารที่ยังไม่เสริฟ',
        link: '/kitchen/pending',
    },
    {
        name: 'สรุปยอดขาย',
        link: '/summary',
    },
    {
        name: 'สรุปรายการอาหาร',
        link: '/summary/list',
    },
    {
        name: 'ออกจากระบบ',
        link: '/logout',
    }
];

export function NavFrame() {
    const { authUser } = useAuth();
    if (!authUser) {
        return <></>;
    }
    return <BurgerMenu navItems={ DEFAULT_NAV_CONFIG } />;
}

export default function MainFrame({
    children,
}: {
    children: React.ReactNode
}) {
    const { authUser } = useAuth();
    return (
        <>
            <AuthUserProvider>
                <div className="frame">
                    <header className="header">
                        <h1 className="header__text">Luangpor Cafe</h1>
                    </header>
                    <div className="main-panel">
                        <NavFrame></NavFrame>
                        {children}
                    </div>
                </div>
            </AuthUserProvider>
        </>
    )
}