'use client'

import { useEffect, useRef, useState } from 'react';
import { orderItemApi } from '../../../api/order-item/order-item-impl';
import { OrderedMenuItem, Subscription } from '../../../api/order';
import SummaryItem from '../../../components/summary-item';
import AuthGuard from '@/guards/auth-guard';
import s from '../page.module.css';
import { useSearchParams } from 'next/navigation';

interface SummaryPageRef {
    subscription?: Subscription;
}

export default function SummaryPage() {
    const searchParams = useSearchParams();
    const date = searchParams.get('date') ?? new Date().toString();
    const [menuItems, setMenuItems] = useState<OrderedMenuItem[]>([])

    const ref = useRef<SummaryPageRef>({
        subscription: undefined,
    });

    useEffect(() => {
        async function preparePage() {
            const queryDate = new Date(date);
            const subscription = orderItemApi.onOrderItemsChangeByDate(queryDate, (items) => {
                setMenuItems(items);
            });
            ref.current.subscription = subscription;
        }
        preparePage();
    }, [date]);

    function renderCartItem(item: OrderedMenuItem, idx: number) {
        return (<SummaryItem key={ idx } itemNo={ idx + 1 } item={ item } onRemove={ () => {}} />)
    }

    return (
        <AuthGuard>
            <h1 className="page-header">สรุปรายการเมนูทั้งหมด</h1>
            <div style={{marginTop: '12px'}}><b>วันที่</b>: { new Date().toLocaleDateString() }</div>
            <div style={{marginTop: '12px'}}><b>จำนวนเมนู</b>: { menuItems.length } เมนู</div>
            {
                menuItems.length > 0 ? menuItems.map(renderCartItem) :
                <p><br />ไม่มีรายการ</p>
            }
        </AuthGuard>
    )
}