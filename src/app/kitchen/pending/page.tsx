'use client'

import AuthGuard from '@/guards/auth-guard';
import { useAuth } from '@/app/login/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { OrderedMenuItem, OrderedMenuItemStatus, Subscription } from '../../../api/order';
import { orderItemApi } from '../../../api/order-item/order-item-impl';
import KitchenItem from '../../../components/kitchen-item';

interface KitchenPageRef {
    subscription?: Subscription;
}

export default function PendingKitchenPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authUser } = useAuth();
    const date = searchParams.get('date') ?? new Date().toString();
    const [menuItems, setMenuItems] = useState<OrderedMenuItem[]>([])

    const ref = useRef<KitchenPageRef>({
        subscription: undefined,
    });


    const [startDate, setStartDate] = useState(new Date());
    function onDateChange(date: Date) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', String(date.getTime()));
        const newParams = params.toString()
        router.push(`/kitchen/pending?${newParams}`);
    }

    useEffect(() => {
        async function preparePage() {
            let queryDate: Date;
            const date = searchParams.get('date') ?? new Date().toString();
            if (Number.isInteger(Number(date))) {
                queryDate = new Date(Number(date));
                setStartDate(new Date(Number(date)));
            } else {
                queryDate = new Date(date);
                setStartDate(new Date(date));
            }
            const items = await orderItemApi.getItemsByDateAndStatus(queryDate, [OrderedMenuItemStatus.PENDING, OrderedMenuItemStatus.PREPARING]);
            setMenuItems(items);
            const subscription = orderItemApi.onOrderItemsChangeByDateAndStatus(queryDate, [OrderedMenuItemStatus.PENDING, OrderedMenuItemStatus.PREPARING], (items) => {
                setMenuItems(items)
            });
            ref.current.subscription = subscription;
        }

        if (authUser) {
            preparePage();
        }
    }, [date, authUser, searchParams]);

    function renderCartItem(item: OrderedMenuItem, idx: number) {
        return (<KitchenItem key={ idx } item={ item } onRemove={ () => {}} />)
    }

    function renderCartItems(): JSX.Element | JSX.Element[] {
        if (menuItems.length === 0) {
            return <>ไม่มีรายการ</>;
        }
        return menuItems.map(renderCartItem);
    }

    return (
        <AuthGuard>
            <div>
                <h1 className="page-header">รายการอาหารที่ยังไม่เสริฟ วันที่ <DatePicker selected={startDate} onChange={ onDateChange } /></h1>
                { renderCartItems() }
            </div>
        </AuthGuard>
    )
}