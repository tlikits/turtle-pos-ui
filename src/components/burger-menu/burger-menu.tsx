'use client';

import { useState } from 'react';
import s from './component.module.css';

export interface NavItem {
    name: string;
    link: string;
}

interface BurgerMenuItemProps {
    navItems: NavItem[];
}

export default function BurgerMenu({ navItems }: BurgerMenuItemProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

    function renderLinks(): JSX.Element[] {
        return navItems.map(renderLink)
    }

    function renderLink(item: NavItem, idx: number): JSX.Element {
        return (
            <a key={ idx } href={ item.link } className={ s['nav-link'] }>{ item.name }</a>
        );
    }

    function getNavBurgerClass(): string {
        if (isOpen) {
            return `${s['nav-burger']} ${s['nav-burger--close']}`;
        }
        return s['nav-burger'];
    }


    return (
        <>
            <div className={ getNavBurgerClass() } onClick={() => setIsOpen(!isOpen) } >
                <div></div>
                <div></div>
                <div></div>
            </div>
            {
                isOpen ?
                <nav className={ s['nav-panel'] }>
                    <div className={ s['nav-block'] }>
                        { renderLinks() }
                    </div>
                </nav> : undefined
            }
        </>
    )
}