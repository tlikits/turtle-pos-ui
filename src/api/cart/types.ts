import { NewOrder, OrderedMenuItem } from '../order';

export type Cart = NewOrder;
export type CartItem = OrderedMenuItem;

export interface CartApi {
    addItemToCart(item: CartItem): Promise<void>;
    clearCart(): Promise<void>;
    getCart(): Promise<Cart>;
    setCart(order: Cart): Promise<void>;
}
