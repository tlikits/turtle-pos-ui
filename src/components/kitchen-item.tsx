import { useAuth } from '@/app/login/contexts/auth-context';
import { OrderedMenuItem, OrderedMenuItemStatus, SelectedMenuOption } from '../api/order';
import { orderItemApi } from '../api/order-item/order-item-impl';
import { OrderUtils } from '../api/order/order-util';

export interface CartItemProps {
    item: OrderedMenuItem;
    onRemove?: () => void;
}

function shouldShowOption(option: SelectedMenuOption): boolean {
    return option.calculateType !== 'BASE' && !option.default;
}

function hasOptionPart(item: OrderedMenuItem): boolean {
    return item.options.some(shouldShowOption) || !!item.note;
}

export default function KitchenItem({ onRemove, item }: CartItemProps): JSX.Element {
    const { authUser } = useAuth();
    const authUserName = authUser?.displayName ?? '';

    const baseOptionIdx = item.options.findIndex(option => option.calculateType === 'BASE');
    const baseOption = item.options[baseOptionIdx];

    function renderOptionDescriptions() {
        if (!hasOptionPart(item)) {
            return undefined;
        }
        return (
            <div className="cart__options">
                { item.options.map(renderOptionDescription) }
                { item.note ? (<p>- โน๊ต • { item.note }</p>) : undefined }
            </div>
        )
    }

    function serve() {
        const isYes = confirm('คอนเฟิร์มเพื่อเปลี่ยนสถานะเป็นเสริฟแล้ว')
        if (!isYes) {
            return;
        }
        return orderItemApi.updateOrderItemStatus(item.orderId, item.id, OrderedMenuItemStatus.SERVED, authUserName);
    }

    function preparing() {
        const isYes = confirm('คอนเฟิร์มเพื่อเปลี่ยนสถานะเป็นกำลังรอทำ')
        if (!isYes) {
            return;
        }
        return orderItemApi.updateOrderItemStatus(item.orderId, item.id, OrderedMenuItemStatus.PREPARING, authUserName);
    }

    function prepared() {
        const isYes = confirm('คอนเฟิร์มเพื่อเปลี่ยนสถานะเป็นรอเสริฟ')
        if (!isYes) {
            return;
        }
        return orderItemApi.updateOrderItemStatus(item.orderId, item.id, OrderedMenuItemStatus.PREPARED, authUserName);
    }

    function pending() {
        const isYes = confirm('คอนเฟิร์มเพื่อเปลี่ยนสถานะกลับเป็นกำลังทำ')
        if (!isYes) {
            return;
        }
        return orderItemApi.updateOrderItemStatus(item.orderId, item.id, OrderedMenuItemStatus.PENDING, authUserName);
    }

    function renderOptionDescription(option: SelectedMenuOption, idx: number): JSX.Element | undefined {
        if (!shouldShowOption(option)) {
            return undefined;
        }
        return (<p key={ idx }>- { option.nameTh } • { option.choiceNameTh }</p>);
    }

    return (
        <div className="cart">
            <div className="cart-main" style={ { overflow: 'hidden' } }>
                {
                    item.status === 'PENDING' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'grey'}}></div> :
                        undefined
                }
                {
                    item.status === 'PREPARING' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'orange'}}></div> :
                        undefined
                }
                {
                    item.status === 'PREPARED' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'rgb(13 64 179)'}}></div> :
                        undefined
                }
                {
                    item.status === 'SERVED' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'green'}}></div> :
                        undefined
                }
                <div className="cart__menu-description">
                    <span className="cart__menu-name">{ item.nameTh } - { baseOption.choiceNameTh }{ item.price === 0 ? (<span style={{color: 'rgb(86 136 255)', fontWeight: 'normal'}}>&nbsp;(0฿)</span>) : undefined}</span>
                </div>
                {
                    item.status === 'PENDING' ?
                        <>
                            <button onClick={ preparing } className="action-btn" style={{backgroundColor: 'orange'}}>เตรียมเมนู</button>
                            <button onClick={ prepared } className="action-btn" style={{backgroundColor: 'rgb(13 64 179)'}}>รอเสริฟ</button>
                            <button onClick={ serve } className="action-btn" style={{backgroundColor: '#107b10'}}>เสริฟ</button>
                        </> :
                        undefined
                }
                {
                    item.status === 'PREPARING' ?
                        <>
                            <button onClick={ prepared } className="action-btn" style={{backgroundColor: 'rgb(13 64 179)'}}>รอเสริฟ</button>
                            <button onClick={ serve } className="action-btn" style={{backgroundColor: '#107b10'}}>เสริฟ</button>
                        </> :
                        undefined
                }
                {
                    item.status === 'PREPARED' ?
                        <>
                            <button onClick={ serve } className="action-btn" style={{backgroundColor: '#107b10'}}>เสริฟ</button>
                        </> :
                        undefined
                }
                {
                    item.status === 'SERVED' ?
                        <button onClick={ pending } className="action-btn" style={{backgroundColor: 'grey'}}>เปลี่ยนสถานะเป็นกำลังรอทำ</button> :
                        undefined
                }
            </div>
            <div style={{ fontSize: '12px', marginLeft: '12px' }}>{ OrderUtils.getTimeLongFormat(item.createdAt) }น.</div>
            {  renderOptionDescriptions() }
        </div>
    )
}