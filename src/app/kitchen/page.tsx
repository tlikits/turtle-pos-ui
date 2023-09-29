'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { OrderedMenuItem, Subscription } from '../../api/order';
import { orderItemApi } from '../../api/order-item/order-item-impl';
import KitchenItem from '../../components/kitchen-item';
import AuthGuard from '../../guards/auth-guard';
import { useAuth } from '../login/contexts/auth-context';


interface KitchenPageRef {
    subscription?: Subscription;
}

export default function KitchenPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authUser } = useAuth();
    const [menuItems, setMenuItems] = useState<OrderedMenuItem[]>([])

    const ref = useRef<KitchenPageRef>({
        subscription: undefined,
    });

    const [startDate, setStartDate] = useState(new Date());
    function onDateChange(date: Date) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', String(date.getTime()));
        const newParams = params.toString()
        router.push(`/kitchen?${newParams}`);
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
            const items = await orderItemApi.getItemsByDate(queryDate);
            setMenuItems(items);
            const subscription = orderItemApi.onOrderItemsChangeByDate(queryDate, (items) => {
                setMenuItems(items)
            });
            ref.current.subscription = subscription;
        }

        if (authUser) {
            preparePage();
        }
    }, [authUser, searchParams]);

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
                <h1 className="page-header">รายการอาหาร วันที่ <DatePicker selected={startDate} onChange={ onDateChange } /></h1>
                { renderCartItems() }
            </div>
        </AuthGuard>
    )
}