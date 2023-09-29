'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Order, OrderList, Subscription, orderApi } from '../../api/order';
import AuthGuard from '../../guards/auth-guard';
import { useAuth } from '../login/contexts/auth-context';
import OrderBox from './components/order-box';
import s from './page.module.css';

interface OrdersPageRef {
    subscription?: Subscription;
}

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orderList, setOrderList] = useState<OrderList>([]);
    const ref = useRef<OrdersPageRef>({
        subscription: undefined,
    });
    const { authUser } = useAuth();
    const [startDate, setStartDate] = useState(new Date());
    function onDateChange(date: Date) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', String(date.getTime()));
        const newParams = params.toString()
        router.push(`/orders?${newParams}`);
    }

    useEffect(() => {
        async function preparePage() {
            if (!authUser) {
                return;
            }
            let queryDate: Date;
            const date = searchParams.get('date') ?? new Date().toString();
            if (Number.isInteger(Number(date))) {
                queryDate = new Date(Number(date));
                setStartDate(new Date(Number(date)));
            } else {
                queryDate = new Date(date);
                setStartDate(new Date(date));
            }
            const list = await orderApi.getOrderListByDate(queryDate, 'asc');
            setOrderList(list);
            const subscription = orderApi.onOrdersChangedByDate(queryDate, (orderList) => {
                setOrderList(orderList)
            }, 'asc');
            ref.current.subscription = subscription;
        }
        preparePage();
    }, [authUser, searchParams]);

    function renderOrderBox(order: Order, idx: number): JSX.Element {
        return (<OrderBox key={ idx } orderId={ idx + 1 } order={ order } />);
    }

    function renderOrderBoxes(orderList: OrderList): JSX.Element |  JSX.Element[] {
        if (orderList.length == 0) {
            return (<>ไม่มีรายการ</>)
        }
        return orderList.map(renderOrderBox);
    }

    return (
        <AuthGuard>
            <div className={s['orders-main-block']}>
                <h1 className="page-header">รายการออเดอร์ วันที่ <DatePicker selected={startDate} onChange={ onDateChange } /></h1>
                <Link href="/orders/new" className={s['new-order-btn']}>+</Link>
                <div className="order-container">
                    { renderOrderBoxes(orderList) }
                </div>
            </div>
        </AuthGuard>
    )
}