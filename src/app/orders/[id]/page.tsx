'use client';

import { useEffect, useRef, useState } from 'react';
import { BaristaHelper } from '../../../api/barista-helper';
import { Order, OrderStatus, OrderedMenuItem, PaymentMethod, PaymentStatus, Subscription, orderApi } from '../../../api/order';
import CartItem2 from '../../../components/cart-item2';
import { OrderUtils } from '../../../api/order/order-util';
import { orderItemApi } from '@/api/order-item/order-item-impl';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/guards/auth-guard';
import { useAuth } from '@/app/login/contexts/auth-context';

interface ShowOrderRef {
    orderSubscription?: Subscription;
    itemsSubscription?: Subscription;
}

export default function ShowOrder({ params }: { params: { id: string }}) {
    const router = useRouter();
    const { id } = params;
    const [order, setOrder] = useState<Order | undefined>(undefined)
    const [menuItems, setMenuItem] = useState<OrderedMenuItem[]>([]);
    const [cartPrice, setCartPrice] = useState(0);
    const [orderStatus, setOrderStatus] = useState(statusToThai(order?.status));
    const ref = useRef<ShowOrderRef>({
        orderSubscription: undefined,
    });
    const { authUser } = useAuth();

    function statusToThai(status: OrderStatus | undefined) {
        switch (status) {
            case 'PREPARED':
                return 'กำลังรอเสริฟ';
            case 'PENDING':
            default:
                return 'กำลังรอทำ';
        }
    }

    function paymentMethodToThai(method?: PaymentMethod) {
        switch (method) {
            case 'FREE':
                return 'ฟรี';
            case 'TRANSFER':
                return 'โอนเงิน';
            case 'CASH':
                return 'เงินสด';
            default:
                return 'ยังไม่ได้ชำระเงิน';
        }
    }

    useEffect(() => {
        async function preparePage() {
            if (!authUser) {
                return;
            }
            const orderFromDB = await orderApi.getOrderById(id);
            if (orderFromDB) {
                setOrder(orderFromDB);
                setMenuItem(orderFromDB.items);
                setCartPrice(BaristaHelper.calculateTotalPriceFromOrder(orderFromDB));
                const orderSubscription = orderApi.onOrderChanged(orderFromDB.id, (order) => {
                    setOrder(order);
                });
                ref.current.orderSubscription = orderSubscription;

                const itemsSubscription = orderItemApi.onOrderItemsInOrderChange(orderFromDB.id, (items) => {
                    setMenuItem(items);
                });
                ref.current.itemsSubscription = itemsSubscription;

            }
        }
        preparePage();
    }, [id, authUser]);

    async function onRemoveItem(item: OrderedMenuItem) {
        const isConfirmed = confirm(`ต้องการลบรายการ "${item.nameTh}" ออกจากออเดอร์ใช่หรือไม่`);
        if (!isConfirmed) {
            return;
        }
        await orderItemApi.deleteItem(item.orderId, item.id);
    }

    async function onRemoveOrder() {
        if (!order) {
            return;
        }
        const isConfirmed = confirm(`ต้องการลบออเดอร์นี้ออกจากระบบใช่หรือไม่`);
        if (!isConfirmed) {
            return;
        }
        orderApi.deleteOrder(order.id);
        setOrder(undefined);
        router.push('/orders');
    }

    async function onPaidWithCash(status?: PaymentStatus) {
        if (!order) {
            return;
        }
        const confirmText = status === PaymentStatus.PAID ? 'ต้องการเปลี่ยนรายการเป็นชำระด้วยเงินสด' : 'ยืนยันการชำระเงินสด';
        const isConfirmed = confirm(confirmText);
        if (!isConfirmed) {
            return;
        }
        await orderApi.updateOrderPaymentStatus(order.id, PaymentStatus.PAID, PaymentMethod.CASH);
        alert('อัพเดทการชำระเงินเรียบร้อย');
    }

    async function onPaidWithTransfer(status?: PaymentStatus) {
        if (!order) {
            return;
        }
        const confirmText = status === PaymentStatus.PAID ? 'ต้องการเปลี่ยนรายการเป็นชำระด้วยเงินโอน' : 'ยินยันการชำระเงินโอน';
        const isConfirmed = confirm(confirmText);
        if (!isConfirmed) {
            return;
        }
        await orderApi.updateOrderPaymentStatus(order.id, PaymentStatus.PAID, PaymentMethod.TRANSFER);
        alert('อัพเดทการชำระเงินเรียบร้อย');
    }

    async function onNotPaid() {
        if (!order) {
            return;
        }
        const isConfirmed = confirm('ต้องการยกเลิกประวัติการชำระเงิน');
        if (!isConfirmed) {
            return;
        }
        await orderApi.updateOrderPaymentStatus(order.id, PaymentStatus.PENDING, PaymentMethod.NONE);
        alert('อัพเดทการชำระเงินเรียบร้อย');
    }

    function renderCartItem(item: OrderedMenuItem, idx: number) {
        return (<CartItem2 key={ idx } item={ item } onRemove={ () => onRemoveItem(item) } />)
    }

    if (!order) {
        return (<>Not found</>);
    }
    return (
        <AuthGuard>
            <b>Order - { OrderUtils.getOrderTimeLongFormat(order) }</b>
            <p><b>สถานะออเดอร์</b>: { orderStatus }</p>
            <p><b>วิธีการชำระเงิน</b>: { paymentMethodToThai(order.paymentMethod) }</p>
            <p><b>สถานะการชำระเงิน</b>: { order.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'รอชำระเงิน' }</p>
            <p><b>ผู้สร้างออเดอร์</b>: { order.createdBy }</p>
            <p><b>โน๊ต</b>: { order.note ?? '-' }</p>
            <div className="cart-item-block">
                { menuItems.map(renderCartItem) }
            </div>
            <div className="cart-sum">
                <div className="cart-sum-top" style={{ borderBottom: '1px solid #ddd', paddingBottom: '14px' }}>
                    <span className="cart-sum-top__title">ราคารวม</span>
                    <span className="cart-sum-top__total">{ cartPrice }฿</span>
                </div>
            </div>
            { order.paymentMethod !== 'CASH' ? <button  className="order-btn" onClick={ () => onPaidWithCash(order.paymentStatus) }>ชำระเงินสด</button> : undefined }
            { order.paymentMethod !== 'TRANSFER' ? <button  className="order-btn" onClick={ () => onPaidWithTransfer(order.paymentStatus) }>ชำระเงินโอน</button> : undefined }
            { order.paymentStatus === PaymentStatus.PAID ? <button  className="order-btn" onClick={ onNotPaid }>ยกเลิกประวัติการชำระเงิน</button> : undefined }
            <button  className="order-btn" onClick={ onRemoveOrder }>ลบออเดอร์นี้</button>
        </AuthGuard>
    )
}