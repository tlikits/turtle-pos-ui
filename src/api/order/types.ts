import { CalculateType, MenuItem } from '../model';

export type OrderStatus = 'PENDING' | 'ORDER_PLACED' | 'PREPARING' | 'PREPARED' | 'SERVED' | 'CANCELED';
export enum OrderedMenuItemStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    PREPARED = 'PREPARED',
    SERVED = 'SERVED',
    CANCELED = 'CANCELED',
}

export enum PaymentMethod {
    NONE = 'NONE',
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    FREE = 'FREE',
}

export enum PaymentStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
}

export interface SelectedMenuOption {
    id: string;
    name: string;
    nameTh: string;
    calculateType: CalculateType;
    choiceName: string;
    choiceNameTh: string;
    price: number;
    default: boolean; // true if the option choice is default one
}

export interface OrderedMenuItem extends Omit<MenuItem, 'options' | 'basePrice'> {
    orderId: string;
    basePrice: number;
    price: number;
    options: SelectedMenuOption[];
    note: string;
    status: OrderedMenuItemStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id: string;
    items: OrderedMenuItem[]; // should be in subcollection (in order-item)
    status: OrderStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    note: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>; // todo: define dedicated interface for new order
export type OrderNoId = Omit<Order, 'id'>;

export type OrderList = Order[];

export interface Subscription {
    unsubscribe(): void;
}

export interface OrderApi {
    clearTodayOrder(): Promise<void>;
    createNewOrder(order: NewOrder, creator: string): Promise<Order>;
    deleteOrder(orderId: string): Promise<void>;
    getActiveOrderList(date: Date): Promise<OrderList>;
    getOrderList(): Promise<OrderList>;
    getOrderListByDate(date: Date, order?: 'desc' | 'asc'): Promise<OrderList>;
    getOrderById(id: string): Promise<Order | undefined>;
    getTodayOrderList(): Promise<OrderList>;
    onOrderChanged(id: string, onNext: (order: Order) => void): Subscription;
    onActiveOrdersChanged(date: Date, onNext: (orders: OrderList) => void): Subscription;
    onOrdersChanged(onNext: (order: OrderList) => void): Subscription
    onOrdersChangedByDate(date: Date, onNext: (order: OrderList) => void, order?: 'desc' | 'asc'): Subscription
    onTodayOrdersChanged(onNext: (order: OrderList) => void): Subscription;
    updateOrder(order: Order): Promise<void>;
    updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
    updateOrderItemStatus(orderId: string, orderItemId: string, status: OrderedMenuItemStatus, updatedBy: string): Promise<void>;
}
