import { useEffect, useState } from 'react';
import { BaristaHelper } from '../api/barista-helper';
import { NewOrder, OrderedMenuItem, PaymentMethod } from '../api/order';
import CartItem from './cart-item';

interface CartPanelProps {
    onClose: () => Promise<void> | void;
    onNewOrder: (newOrder: NewOrder) => Promise<void> | void;
    onRemove: (idx: number) => Promise<void> | void;
    onPaymentMethodChange?: (method: PaymentMethod | undefined) => Promise<void> | void;
    cart: NewOrder;
}

export default function CartPanel({ onClose, onRemove, onNewOrder, onPaymentMethodChange, cart }: CartPanelProps): JSX.Element {
    const [cartPrice, setCartPrice] = useState(0);
    const [note, setNote] = useState('');

    useEffect(() => {
        setCartPrice(BaristaHelper.calculateTotalPriceFromOrder(cart));
    }, [cart]);

    function createNewOrder() {
        onNewOrder({
            ...cart,
            note
        });
    }

    function onPaymentMethodSelected(method: PaymentMethod | undefined) {
        if (onPaymentMethodChange) {
            onPaymentMethodChange(method);
        }
    }

    function renderCartItem(item: OrderedMenuItem, idx: number) {
        return (<CartItem key={ idx } item={ item } onRemove={ () => onRemove(idx)} />)
    }

    return (
        <div className="add-item-container" onClick={ onClose }>
            <div className="add-item-panel" onClick={ (e) => e.stopPropagation() }>
                <div className="page-header">ยืนยันออเดอร์ใหม่</div>
                <button className="add-item-panel__close" onClick={ onClose }></button>
                <div className="cart-item-block">
                    { cart.items.map(renderCartItem) }
                </div>
                <div className="cart-sum" style={{ paddingBottom: '48px' }}>
                    <div className="cart-sum-top">
                        <span className="cart-sum-top__title">ราคารวม</span>
                        <span className="cart-sum-top__total">{ cartPrice }฿</span>
                    </div>
                    <div className="note">
                        <div className="menu-option-block__title">โน๊ต</div>
                        <textarea className="menu-option-block__text" name="menu-note" onChange={ (e) => setNote(e.target.value) }></textarea>
                    </div>
                    <div className="payment-method">
                        <p><label htmlFor="payment-free" >
                            <input type="checkbox" name="payment-free" id="payment-free" checked={ cart.paymentMethod === PaymentMethod.FREE } onClick={ (e) => onPaymentMethodSelected(cart.paymentMethod === PaymentMethod.FREE ? undefined : PaymentMethod.FREE )} onChange={() => {}}/> ฟรี
                        </label></p>
                    </div>
                    <button className="cart-sum-btn" onClick={ createNewOrder }>สร้างออเดอร์ใหม่</button>
                </div>
            </div>
        </div>
    )
}