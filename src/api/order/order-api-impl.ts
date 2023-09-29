import { db } from '@/firebase-config';
import { DocumentData, DocumentSnapshot, Firestore, Query, QueryDocumentSnapshot, QuerySnapshot, Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { orderItemApi } from '../order-item/order-item-impl';
import { NewOrder, Order, OrderApi, OrderList, OrderNoId, OrderStatus, OrderedMenuItemStatus, PaymentMethod, PaymentStatus, Subscription } from './types';

interface OrderFirestore extends Omit<Order, 'createdAt' | 'updatedAt'> {
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export class OrderApiImpl implements OrderApi {
    private readonly db: Firestore;
    private readonly collectionName = 'orders';

    constructor() {
        this.db = db;
        this.getOrderFromDoc = this.getOrderFromDoc.bind(this);
    }
    public async clearTodayOrder(): Promise<void> {
        const ref = collection(this.db, this.collectionName);
        const targetDate = new Date(new Date().toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);
        const queries = query(
            ref,
            orderBy('createdAt', 'desc'),
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),

        );
        const getDocsResult = await getDocs(queries);
        const promises = getDocsResult.docs.map(doc => {
            const promises = [
                deleteDoc(doc.ref),
                orderItemApi.deleteItemsFromOrder(doc.id),
            ];
            return Promise.all(promises);
        });
        await Promise.all(promises);
    }

    public async createNewOrder(order: NewOrder, createdBy: string): Promise<Order> {
        const { items, ...orderObj } = order;
        const newOrder = await this.createOrderFromNewOrder(orderObj, createdBy);
        const doc = await addDoc(collection(this.db, this.collectionName), newOrder);
        const orderId = doc.id;
        if (order.paymentMethod === 'FREE') {
            items.forEach(item => item.price = 0);
        }
        await orderItemApi.addOrderItemsToOrder(orderId, items, newOrder.createdAt, createdBy);
        return {
            ...newOrder,
            id: orderId,
            items,
            createdBy,
        };
    }

    public async deleteOrder(orderId: string): Promise<void> {
        const ref = doc(this.db, this.collectionName, orderId);
        await deleteDoc(ref);
        await orderItemApi.deleteItemsFromOrder(orderId);
    }

    public async getActiveOrderList(date: Date): Promise<OrderList> {
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);
        const ref = collection(this.db, this.collectionName);
        const queries = query(
            ref,
            orderBy('createdAt', 'desc'),
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
            where('status', 'in', ['PENDING', 'ORDER_PLACED', 'PREPARING', 'PREPARED']),
        );
        return this.queryOrders(queries);
    }

    public async getOrderList(): Promise<OrderList> {
        const ref = collection(this.db, this.collectionName);
        const queries = query(ref, orderBy('createdAt', 'desc'));
        return this.queryOrders(queries);
    }

    public async getOrderListByDate(date: Date, order: 'desc' | 'asc' = 'desc'): Promise<OrderList> {
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);
        const ref = collection(this.db, this.collectionName);
        const queries = query(
            ref,
            orderBy('createdAt', order),
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
        );
        return this.queryOrders(queries);
    }

    public async getOrderById(id: string): Promise<Order | undefined> {
        const docRef = doc(this.db, this.collectionName, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            const order = this.convertDocumentSnapshotToOrder(snapshot);
            const items = await orderItemApi.getItems(snapshot.id);
            return {
                ...order,
                id: snapshot.id,
                items,
            };
        }
    }

    public async getTodayOrderList(): Promise<OrderList> {
        return this.getOrderListByDate(new Date(), 'desc');
    }

    public onOrderChanged(id: string, onNext: (order: Order) => void): Subscription {
        const unsubscribe = onSnapshot(doc(this.db, this.collectionName, String(id)), (snapshot: DocumentSnapshot) => {
            if (snapshot.data()) {
                onNext(this.convertDocumentSnapshotToOrder(snapshot));
            }
        });
        return { unsubscribe };
    }

    public onActiveOrdersChanged(date: Date, onNext: (orders: OrderList) => void): Subscription {
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            collection(this.db, this.collectionName),
            orderBy('createdAt', 'desc'),
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
            where('status', 'in', ['PENDING', 'ORDER_PLACED', 'PREPARING', 'PREPARED']),
        );

        const unsubscribe = onSnapshot(q, (qSnapshot: QuerySnapshot) => {
            const orders: OrderList = [];
            qSnapshot.forEach((doc) => {
                orders.push(this.convertDocumentSnapshotToOrder(doc));
            });
            onNext(orders);
        });
        return { unsubscribe };

    }

    public onOrdersChanged(onNext: (order: OrderList) => void): Subscription {
        const q = query(collection(this.db, this.collectionName));

        const unsubscribe = onSnapshot(q, (qSnapshot: QuerySnapshot) => {
            const orders: OrderList = [];
            qSnapshot.forEach((doc) => {
                orders.push(this.convertDocumentSnapshotToOrder(doc));
            });
            onNext(orders);
        });
        return { unsubscribe };
    }

    public onOrdersChangedByDate(date: Date, onNext: (order: OrderList) => void, order: 'desc' | 'asc' = 'desc'): Subscription {
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            collection(this.db, this.collectionName),
            orderBy('createdAt', order),
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
        );

        const unsubscribe = onSnapshot(q, async (qSnapshot: QuerySnapshot) => {
            const promises: Promise<Order>[] = [];
            qSnapshot.forEach((doc) => {
                promises.push(this.getOrderFromDoc(doc));
            });
            onNext(await Promise.all(promises));
        });
        return { unsubscribe };
    }

    public onTodayOrdersChanged(onNext: (order: OrderList) => void): Subscription {
        return this.onOrdersChangedByDate(new Date(), onNext, 'desc');
    }

    public async updateOrder(order: Order): Promise<void> {
        const { items, ...orderProps } = order;
        const ref = doc(this.db, this.collectionName, String(order.id));
        await setDoc(ref, orderProps);
    }

    public async updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod): Promise<void> {
        const ref = doc(this.db, this.collectionName, orderId);
        await updateDoc(ref, {
            paymentMethod,
            paymentStatus,
            updatedAt: new Date(),
        });
    }

    public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
        const ref = doc(this.db, this.collectionName, orderId);
        await updateDoc(ref, {
            status,
            updatedAt: new Date(),
        });
    }

    public async updateOrderItemStatus(orderId: string, orderItemId: string, status: OrderedMenuItemStatus, updatedBy: string): Promise<void> {
        // update order item
        const now = new Date();
        await orderItemApi.updateOrderItemStatus(orderId, orderItemId, status, updatedBy, now);

        // update orderand its status
        const orderRef = doc(this.db, this.collectionName, orderId);
        const updateProps = {
            updatedAt: now,
            updatedBy,
        };
        const [countPending, countPreparing] = await Promise.all([
            orderItemApi.countItemsInOrderFromStatus(orderId, OrderedMenuItemStatus.PENDING),
            orderItemApi.countItemsInOrderFromStatus(orderId, OrderedMenuItemStatus.PREPARING),
        ]);
        if (countPending + countPreparing ===  0) {
            Object.assign(updateProps, { status: 'SERVED' });
        }

        return updateDoc(orderRef, updateProps);
    }

    private convertDocumentSnapshotToOrder(doc: DocumentSnapshot | DocumentData): Order {
        const data = doc.data() as OrderFirestore;
        return {
            ...data,
            id: doc.id,
            createdAt: data?.createdAt?.toDate(),
            updatedAt: data?.updatedAt?.toDate(),
        };
    }

    private async createOrderFromNewOrder(newOrder: NewOrder | Omit<NewOrder, 'items'>, creator: string): Promise<Omit<OrderNoId, 'items'>> {
        const now = new Date();
        return {
            ...newOrder,
            createdAt: now,
            updatedAt: now,
            createdBy: creator,
            updatedBy: creator,
        };
    }

    private async queryOrders(query: Query): Promise<OrderList> {
        const getDocsResult = await getDocs(query);
        const { docs } = getDocsResult;
        return Promise.all(docs.map(this.getOrderFromDoc));
    }

    private async getOrderFromDoc(doc: QueryDocumentSnapshot): Promise<Order> {
        const order = this.convertDocumentSnapshotToOrder(doc);
        order.id = doc.id;
        const items = await orderItemApi.getItems(order.id);
        order.items = items;
        return order;
    }
}

export const orderApi: OrderApi = new OrderApiImpl();
