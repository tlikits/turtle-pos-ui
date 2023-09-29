'use client'

import AuthGuard from '@/guards/auth-guard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { OrderedMenuItem, Subscription } from '../../../api/order';
import { orderItemApi } from '../../../api/order-item/order-item-impl';
import SummaryItem from '../../../components/summary-item';

interface SummaryPageRef {
    subscription?: Subscription;
}

export default function SummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const date = searchParams.get('date') ?? new Date().toString();
    const [menuItems, setMenuItems] = useState<OrderedMenuItem[]>([])
    const [startDate, setStartDate] = useState(new Date());

    const ref = useRef<SummaryPageRef>({
        subscription: undefined,
    });

    function onDateChange(date: Date) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', String(date.getTime()));
        const newParams = params.toString()
        router.push(`/summary/list?${newParams}`);
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
            const subscription = orderItemApi.onOrderItemsChangeByDate(queryDate, (items) => {
                setMenuItems(items);
            });
            ref.current.subscription = subscription;
        }
        preparePage();
    }, [date, searchParams]);

    function renderCartItem(item: OrderedMenuItem, idx: number) {
        return (<SummaryItem key={ idx } itemNo={ idx + 1 } item={ item } onRemove={ () => {}} />)
    }

    return (
        <AuthGuard>
            <h1 className="page-header">สรุปรายการเมนูทั้งหมด</h1>
            <div style={{marginTop: '12px'}}><b>วันที่</b>: <DatePicker selected={startDate} onChange={ onDateChange } /></div>
            <div style={{marginTop: '12px'}}><b>จำนวนเมนู</b>: { menuItems.length } เมนู</div>
            {
                menuItems.length > 0 ? menuItems.map(renderCartItem) :
                <p><br />ไม่มีรายการ</p>
            }
        </AuthGuard>
    )
}