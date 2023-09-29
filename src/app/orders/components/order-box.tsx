import { orderItemApi } from '@/api/order-item/order-item-impl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BaristaHelper } from '../../../api/barista-helper';
import { Order, OrderedMenuItem, PaymentStatus } from '../../../api/order';
import s from './order-box.module.css';
import { OrderedMenuItemStatus, PaymentMethod } from '@/api/order/types';

export interface OrderBoxProps {
    order: Order;
    orderId: number;
}

export default function OrderBox({ order, orderId }: OrderBoxProps) {
    const [menuItems, setMenuItems] = useState(order.items);
    const [orderStatus, setOrderStatus] = useState(order.status);

    useEffect(() => {
        function getOrderStatus(items: OrderedMenuItem[]) {
            const isCanceled = items.every(item => item.status === OrderedMenuItemStatus.CANCELED);
            if (items.length === 0 || isCanceled) {
                return OrderedMenuItemStatus.CANCELED;
            }
            const isServed = items.every(item => [OrderedMenuItemStatus.SERVED, OrderedMenuItemStatus.CANCELED].includes(item.status));
            if (isServed) {
                return OrderedMenuItemStatus.SERVED;
            }
            const isPreparing = items.some(item => [OrderedMenuItemStatus.PREPARING].includes(item.status));
            if (isPreparing) {
                return OrderedMenuItemStatus.PREPARING;
            }
            const isPending = items.every(item => [OrderedMenuItemStatus.PENDING, OrderedMenuItemStatus.CANCELED].includes(item.status));
            if (isPending) {
                return OrderedMenuItemStatus.PENDING;
            }
            const isPrepared = items.every(item => [OrderedMenuItemStatus.PREPARED, OrderedMenuItemStatus.SERVED, OrderedMenuItemStatus.CANCELED].includes(item.status));
            if (isPrepared) {
                return OrderedMenuItemStatus.PREPARED;
            }
            return OrderedMenuItemStatus.PREPARING;
        }

        orderItemApi.onOrderItemsInOrderChange(order.id, (items) => {
            setMenuItems(items);
            setOrderStatus(getOrderStatus(items));
        });
    }, [order]);



    function waitingText(): string {
        if (orderStatus === OrderedMenuItemStatus.SERVED) {
            return `เสริฟออเดอร์เรียบร้อยแล้ว (${menuItems.length} เมนู)`;
        }
        if (orderStatus === OrderedMenuItemStatus.CANCELED) {
            return 'ยกเลิกออเดอร์แล้ว';
        }
        if (orderStatus === OrderedMenuItemStatus.PENDING) {
            return `กำลังรอทำ`;
        }
        if (orderStatus === OrderedMenuItemStatus.PREPARED) {
            return `กำลังรอเสริฟ`;
        }
        return `กำลังทำ`;
    }

    function getTime(date: Date): string {
        const hours = String(date.getHours());
        const minutes = String(date.getMinutes());
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    function renderStatus(): JSX.Element {
        const statusLowerCase = orderStatus.toLowerCase();
        const orderPaymentStatusBandClass = `${s['order-box__status']} ${s[`order-box__status--${statusLowerCase}`]}`;
        return (<div className={ orderPaymentStatusBandClass }>{ waitingText() }</div>);
    }

    const totalPrice = BaristaHelper.calculateTotalPriceFromOrder(order);
    const paymentStatus = order.paymentStatus ?? PaymentStatus.PENDING;
    const isFree = order.paymentMethod === PaymentMethod.FREE;
    const isPaid = isFree || paymentStatus === PaymentStatus.PAID;

    return (
        <Link className={s['order-box']} href={ `/orders/${order.id}` }>
            <div className={s['order-box__top']}>
                <div className={s['order-box__name']} >
                    <span className={s['order-box__name-text']}>Order #{ orderId }</span>
                    { isFree && <span className={`${s['order-payment-text']} ${s['order-payment-text__free']}`}>รายการฟรี</span> }
                    { !isPaid && <span className={`${s['order-payment-text']} ${s['order-payment-text__paid']}`}>ยังไม่ชำระเงิน</span> }
                </div>
                <div className={s['order-box__total']}>{ totalPrice }฿</div>
            </div>
            <div className={s['order-box__btm']}>
                { renderStatus() }
                <div className={s['order-box__time']}>{ getTime(order.createdAt) }น.</div>
            </div>
        </Link>
    );
}