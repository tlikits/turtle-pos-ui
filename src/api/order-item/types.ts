import { OrderedMenuItem, OrderedMenuItemStatus, Subscription } from '../order';

export interface OrderItemApi {
    addOrderItemsToOrder(id: string, items: OrderedMenuItem[], createdAt: Date, createdBy: string): Promise<void>;
    countItemsInOrderFromStatus(orderId: string, status: OrderedMenuItemStatus): Promise<number>;
    deleteItem(orderId: string, itemId: string): Promise<void>;
    deleteItemsFromOrder(orderId: string): Promise<void>;
    getItems(id: string): Promise<OrderedMenuItem[]>;
    getItemsByDate(date: Date): Promise<OrderedMenuItem[]>;
    getItemsByDateAndStatus(date: Date, statuses: OrderedMenuItemStatus[]): Promise<OrderedMenuItem[]>;
    onOrderItemsInOrderChange(orderId: string, onNext: (items: OrderedMenuItem[]) => void): Subscription;
    onOrderItemsChangeByDate(date: Date, onNext: (items: OrderedMenuItem[]) => void): Subscription;
    onOrderItemsChangeByDateAndStatus(date: Date, statuses: OrderedMenuItemStatus[], onNext: (items: OrderedMenuItem[]) => void): Subscription;
    removeOrderItemFromOrder(): Promise<void>;
    updateOrderItemStatus(orderId: string, orderItemId: string, status: OrderedMenuItemStatus, updatedBy: string, date?: Date): Promise<void>;
}