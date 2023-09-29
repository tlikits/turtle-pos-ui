import { PaymentMethod } from '../order';
import { Cart, CartApi, CartItem } from './types';

const CART_ITEM_LIST_KEY = 'cart';

export class CartApiImpl implements CartApi {
    private readonly localStorage!: Storage;

    constructor() {
        if (typeof window === 'undefined') {
            return;
        }
        this.localStorage = window?.localStorage;
    }

    public async addItemToCart(item: CartItem): Promise<void> {
        const cart = await this.getCart();
        cart.items = [
            ...cart.items,
            item,
        ];
        this.setCart(cart);
    }

    public async clearCart(): Promise<void> {
        this.localStorage.removeItem(CART_ITEM_LIST_KEY);
    }

    public async getCart(): Promise<Cart> {
        const cache = this.localStorage.getItem(CART_ITEM_LIST_KEY);
        if (cache) {
            return JSON.parse(cache);
        }
        return {
            items: [],
            status: 'PENDING',
            note: '',
        };
    }

    public async setCart(order: Cart): Promise<void> {
        this.localStorage.setItem(CART_ITEM_LIST_KEY, JSON.stringify(order));
    }
}

export const cartApi = new CartApiImpl();
