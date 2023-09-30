'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent as ReactMouseEvent, useEffect, useState } from 'react';
import { BaristaHelper } from '../../../api/barista-helper';
import { cartApi } from '../../../api/cart';
import { menuApi } from '../../../api/menu';
import { NewOrder, OrderedMenuItem, PaymentMethod, PaymentStatus, orderApi } from '../../../api/order';
import AddItemPanel from '../../../components/add-item-panel';
import CartPanel from '../../../components/cart-panel';
import AuthGuard from '@/guards/auth-guard';
import { useAuth } from '@/app/login/contexts/auth-context';
import { MenuItem } from '@/api/model';

function generateNewEmptyOrder(): NewOrder {
    return {
        items: [],
        status: 'PENDING',
        note: '',
    };
}

export default function NewOrderPage() {
    const router = useRouter();
    const { authUser } = useAuth();
    const authUserName = authUser?.displayName ?? '';

    const [activeCategory, setActiveCategory] = useState<string>('');
    const [activeMenuItem, setActiveMenuItem] = useState<MenuItem | undefined>(undefined);

    const [availableCategoryOption, setAvailableCategoryOptions] = useState<string[]>([]);
    const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);

    const [isOpenCart, setIsOpenCart] = useState(false);
    const [cart, setCart] = useState<NewOrder>(generateNewEmptyOrder());
    const [cartPrice, setCartPrice] = useState(calculatePriceInCart());

    useEffect(() => {
        async function preparePage() {
            const cart = await cartApi.getCart();
            setAvailableCategoryOptions(await menuApi.getCategories());
            setCart(cart);
            setCartPrice(BaristaHelper.calculateTotalPriceFromOrder(cart));
        }
        if (authUser) {
            preparePage();
        }
    }, [authUser])

    async function clearCategory(): Promise<void> {
        setActiveCategory('');
        setAvailableCategoryOptions(await menuApi.getCategories());
    }

    async function onSelectOption(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        if (activeCategory === '') {
            return onSelectCategory(event);
        }
        return onSelectMenu(event);
    }

    async function onSelectCategory(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
        const selectedCategory = (event.target as any).value;
        const availableMenuItems = await menuApi.getMenuItemsByCategory(selectedCategory);
        setAvailableMenuItems(availableMenuItems);
        const menuNames = availableMenuItems.map(item => item.nameTh);
        setAvailableCategoryOptions(menuNames);
        setActiveCategory(selectedCategory);
    }

    function onSelectMenu(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void {
        const idx = (event.target as any).value;
        setActiveMenuItem(availableMenuItems[idx]);
    }

    async function onCloseMenuPanel(): Promise<void> {
        setActiveMenuItem(undefined);
    }

    async function onUpdatePaymentMethod(method: PaymentMethod | undefined): Promise<void> {
        if (!method) {
            delete cart.paymentMethod;
            delete cart.paymentStatus;
        } else {
            cart.paymentMethod = method;
            cart.paymentStatus = PaymentStatus.PAID;
        }
        await cartApi.setCart(cart);
        setCart({ ...cart });
    }

    function sortOrderItems(items: OrderedMenuItem[]): OrderedMenuItem[] {
        return items.sort((i1, i2) => {
            const i1Options = i1.options.map(option => option.choiceName).join('');
            const i2Options = i2.options.map(option => option.choiceName).join('');
            const i1Key = `${i1.categoryName}${i1.name}${i1Options}`
            const i2Key = `${i2.categoryName}${i1.name}${i2Options}`
            return i1Key.localeCompare(i2Key);
        });
    }

    async function onAddToCart(orderedMenuItem: OrderedMenuItem): Promise<void> {
        cart.items.push(orderedMenuItem);
        cart.items = sortOrderItems(cart.items);
        setCart({ ...cart });
        setCartPrice(calculatePriceInCart());
        setActiveCategory('');
        setAvailableCategoryOptions(await menuApi.getCategories());
        setActiveMenuItem(undefined);
        cartApi.addItemToCart(orderedMenuItem);
    }

    async function createNewOrder(cartData: NewOrder) {
        const order = await orderApi.createNewOrder({
            ...cart,
            note: cartData.note ?? '',
        }, authUserName);
        await cartApi.clearCart();
        setCart(generateNewEmptyOrder());
        setActiveCategory('');
        setAvailableCategoryOptions(await menuApi.getCategories());
        setActiveMenuItem(undefined);
        closeCartPanel();
        router.push(`/orders`);
    }

    function calculatePriceInCart() {
        return BaristaHelper.calculateTotalPriceFromOrder(cart);
    }

    async function removeFromCart(idx: number) {
        cart.items.splice(idx, 1);
        setCart({ ...cart });
        setCartPrice(calculatePriceInCart());
        await cartApi.setCart(cart);
        if (cart.items.length === 0) {
            closeCartPanel();
        }
    }

    function openCartPanel() {
        setIsOpenCart(true);
    }

    function closeCartPanel() {
        setIsOpenCart(false);
    }

    function renderOptions(): JSX.Element[] {
        if (activeCategory === '') {
            return availableCategoryOption.map((name: string, idx: number) => (<button key={ idx } className="menu-item" onClick={ onSelectOption } value={ name }>{ name }</button>));
        }
        return availableMenuItems.map((item: MenuItem, idx: number) => (<button key={ idx } className="menu-item" onClick={ onSelectOption } value={ idx }>{ item.nameTh }</button>))
    }

    function renderBackButton(): JSX.Element | undefined {
        if (!activeCategory) {
            return undefined;
        }
        return <button className="menu-item" onClick={ clearCategory }>← ย้อนกลับ</button>
    }

    function renderActiveMenuItem(): JSX.Element | undefined {
        if (activeMenuItem) {
            return <AddItemPanel
                onAddToCart={ onAddToCart }
                onClose={ onCloseMenuPanel }
                menuItem={ activeMenuItem }
            />
        }
    }

    function renderCartPanel() {
        if (isOpenCart) {
            return <CartPanel
                onRemove={ removeFromCart }
                onClose={ closeCartPanel }
                onNewOrder={ createNewOrder }
                onPaymentMethodChange={ onUpdatePaymentMethod }
                cart={ cart }
            />
        }
    }

    function renderCartButton() {
        if (cart.items.length > 0) {
            return <button className="order-cart-btn" onClick={ openCartPanel }>
                ตะกร้าสินค้า - { cart.items.length } รายการ<span> ฿{ cartPrice }</span>
            </button>
        }
    }

    return (
        <AuthGuard>
            <h1 className="page-header">ออเดอร์ใหม่</h1>
            <nav className="breadcrumb-block">
                <Link className="breadcrumb-item" href="#" onClick={ clearCategory }>ประเภทเมนู</Link>
                { activeCategory ? (<>&gt;<Link className="breadcrumb-item" href="#">{ activeCategory }</Link></>) : undefined }
            </nav>
            <div className="menu-item-block">
                { renderOptions() }
                { renderBackButton() }
            </div>
            { renderActiveMenuItem() }
            { renderCartPanel() }
            { renderCartButton() }
        </AuthGuard>
    )
}