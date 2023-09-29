'use client';

import { useEffect, useRef, useState } from 'react';
import { Subscription, orderApi } from '../../api/order';
import AuthGuard from '../../guards/auth-guard';
import s from './page.module.css';
import { useAuth } from '../login/contexts/auth-context';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

interface SummaryPageRef {
    subscription?: Subscription;
}

export default function SummaryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [total, setTotal] = useState(0);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [freeItemsCount, setFreeItemsCount] = useState(0);
    const [freeSum, setFree] = useState(0);
    const [cash, setCash] = useState(0);
    const [transfer, setTransfer] = useState(0);
    const ref = useRef<SummaryPageRef>({
        subscription: undefined,
    });

    const { authUser } = useAuth();
    const [startDate, setStartDate] = useState(new Date());

    function onDateChange(date: Date) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', String(date.getTime()));
        const newParams = params.toString()
        router.push(`/summary?${newParams}`);
    }

    useEffect(() => {
        async function preparePage() {
            if (!authUser) {
                return;
            }
            const date = searchParams.get('date') ?? new Date().toString();
            let queryDate: Date;

            if (Number.isInteger(Number(date))) {
                queryDate = new Date(Number(date));
                setStartDate(new Date(Number(date)));
            } else {
                queryDate = new Date(date);
                setStartDate(new Date(date));
            }
            const subscription = orderApi.onOrdersChangedByDate(queryDate, (orderList) => {
                const newTotal = orderList.reduce((result, order) => {
                    return result + order.items.reduce((orderTotal, item) => orderTotal + item.price, 0);
                }, 0);

                const newTotalItemsCount = orderList.reduce((result, order) => {
                    return result + order.items.length;
                }, 0);

                const newFreeItemsCount = orderList.reduce((count, order) => {
                    const orderFreeItem = order.items.filter(item => item.price === 0);
                    return count + orderFreeItem.length;
                }, 0);
                const newFree = orderList.filter(order => order.paymentMethod === 'FREE')
                    .reduce((result, order) => {
                        return result + order.items.reduce((sum, item) => sum + item.basePrice, 0)
                    }, 0);
                const newCash = orderList.filter(order => order.paymentMethod === 'CASH')
                    .reduce((result, order) => {
                        return result + order.items.reduce((sum, item) => sum + item.price, 0)
                    }, 0);
                const newTransfer = orderList.filter(order => order.paymentMethod === 'TRANSFER')
                    .reduce((result, order) => {
                        return result + order.items.reduce((sum, item) => sum + item.price, 0)
                    }, 0);
                setTotal(newTotal);
                setTotalItemsCount(newTotalItemsCount);
                setFreeItemsCount(newFreeItemsCount);
                setFree(newFree);
                setCash(newCash);
                setTransfer(newTransfer);

            }, 'asc');
            ref.current.subscription = subscription;
        }
        preparePage();
    }, [searchParams, authUser]);

    function renderItem(title: string, text: string | number | JSX.Element): JSX.Element {
        return (
            <div className={ s['sum-item'] }>
                <div className={ s['sum-item__title'] }>
                    { title }:
                </div>
                <div className={ s['sum-item__text'] }>
                    { text }
                </div>
            </div>
        )
    }

    return (
        <AuthGuard>
            <h1 className="page-header">สรุปยอดขาย</h1>


            { renderItem('วันที่', <DatePicker className={ s['sum-datepicker'] } selected={startDate} onChange={ onDateChange } />) }
            { renderItem('ยอดขายทั้งหมด', `${total}฿`) }
            { renderItem('จ่ายด้วยเงินสด', `${cash}฿`) }
            { renderItem('จ่ายด้วยการโอน', `${transfer}฿`) }
            { renderItem('จำนวนรายการ', `${totalItemsCount} เมนู`) }
            { renderItem('จำนวนรายการที่ไม่คิดเงิน', `${freeItemsCount} เมนู (${freeSum}฿)`) }
        </AuthGuard>
    )
}