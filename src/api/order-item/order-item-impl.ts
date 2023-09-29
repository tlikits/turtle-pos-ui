import { db } from '@/firebase-config';
import { DocumentData, DocumentSnapshot, Firestore, QuerySnapshot, addDoc, collection, collectionGroup, deleteDoc, doc, getCountFromServer, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { OrderedMenuItem, OrderedMenuItemStatus, Subscription } from '../order';
import { OrderItemApi } from './types';

export class OrderItemApiImpl implements OrderItemApi {
    private readonly db: Firestore;
    private readonly parentCollectionName = 'orders';
    private readonly collectionName = 'items';

    constructor() {
        this.db = db;
    }

    public async getItems(id: string): Promise<OrderedMenuItem[]> {
        const col = collection(this.db, this.parentCollectionName, String(id), this.collectionName);
        const queries = query(col);
        const getDocsResult = await getDocs(queries);
        const { docs } = getDocsResult;
        return docs.map(doc => ({
            ...this.convertDocumentSnapshotToOrderMenuItem(doc),
            id: doc.id,
            orderId: doc.ref.parent?.parent?.id ?? '',
        }));
    }

    public async addOrderItemsToOrder(id: string, items: OrderedMenuItem[], createdAt: Date, createdBy: string): Promise<void> {
        const promises = this.sortOrderItems(items).map(async (item, idx) => {
            const { id: removedId, ...itemWithoutId } = item;
            await setDoc(
                doc(this.db, this.parentCollectionName, id, this.collectionName, `${id}${idx}`),
                {
                    ...itemWithoutId,
                    createdAt,
                    updatedAt: createdAt,
                    createdBy: createdBy,
                    updatedBy: createdBy,
                }
            );
        });
        await Promise.all(promises);
    }

    public async countItemsInOrderFromStatus(orderId: string, status: OrderedMenuItemStatus): Promise<number> {
        const col = collection(this.db, this.parentCollectionName, orderId, this.collectionName);
        const q = query(
            col,
            where('status', '==', status),
        );
        const countSnapshot = await getCountFromServer(q);
        return countSnapshot.data().count;
    }

    public async deleteItem(orderId: string, itemId: string): Promise<void> {
        const ref = doc(this.db, this.parentCollectionName, orderId, this.collectionName, itemId);
        await deleteDoc(ref);
    }

    public async deleteItemsFromOrder(orderId: string): Promise<void> {
        const ref = collection(this.db, this.parentCollectionName, orderId, this.collectionName);
        const queries = query(ref);
        const getDocsResult = await getDocs(queries);
        const promises = getDocsResult.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(promises);
    }


    public async getItemsByDate(date: Date): Promise<OrderedMenuItem[]> {
        const colGroup = collectionGroup(db, this.collectionName)
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            colGroup,
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
        );
        const snapshots = await getDocs(q);
        const result: OrderedMenuItem[] = [];
        snapshots.forEach(snapshot => {
            const orderId = snapshot.ref.parent?.parent?.id ?? '';
            result.push({
                ...this.convertDocumentSnapshotToOrderMenuItem(snapshot),
                id: snapshot.id,
                orderId,
            });
        });
        return result;
    }


    public async getItemsByDateAndStatus(date: Date, statuses: OrderedMenuItemStatus[]): Promise<OrderedMenuItem[]> {
        const colGroup = collectionGroup(db, this.collectionName)
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            colGroup,
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
            where('status', 'in', statuses),
        );
        const snapshots = await getDocs(q);
        const result: OrderedMenuItem[] = [];
        snapshots.forEach(snapshot => {
            const orderId = snapshot.ref.parent?.parent?.id ?? '';
            result.push({
                ...this.convertDocumentSnapshotToOrderMenuItem(snapshot),
                id: snapshot.id,
                orderId,
            });
        });
        return result;
    }

    public onOrderItemsInOrderChange(orderId: string, onNext: (order: OrderedMenuItem[]) => void): Subscription {
        const col = collection(db, this.parentCollectionName, orderId, this.collectionName);
        const q = query(col);
        const unsubscribe = onSnapshot(q, (qSnapshot: QuerySnapshot) => {
            const items: OrderedMenuItem[] = [];
            qSnapshot.forEach((doc) => {
                const orderId = doc.ref.parent?.parent?.id ?? '';
                items.push({
                    ...this.convertDocumentSnapshotToOrderMenuItem(doc),
                    id: doc.id,
                    orderId,
                });
            });
            onNext(items);
        });
        return { unsubscribe };

    }

    public onOrderItemsChangeByDate(date: Date, onNext: (order: OrderedMenuItem[]) => void): Subscription {
        const colGroup = collectionGroup(db, this.collectionName)
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            colGroup,
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
        );

        const unsubscribe = onSnapshot(q, (qSnapshot: QuerySnapshot) => {
            const items: OrderedMenuItem[] = [];
            qSnapshot.forEach((doc) => {
                const orderId = doc.ref.parent?.parent?.id ?? '';
                items.push({
                    ...this.convertDocumentSnapshotToOrderMenuItem(doc),
                    id: doc.id,
                    orderId,
                });
            });
            onNext(items);
        });
        return { unsubscribe };
    }

    public onOrderItemsChangeByDateAndStatus(date: Date, statuses: OrderedMenuItemStatus[], onNext: (items: OrderedMenuItem[]) => void): Subscription {
        const colGroup = collectionGroup(db, this.collectionName)
        const targetDate = new Date(date.toDateString());
        const nextDate = new Date(new Date().toDateString());
        nextDate.setDate(targetDate.getDate() + 1);

        const q = query(
            colGroup,
            where('createdAt', '>=', targetDate),
            where('createdAt', '<', nextDate),
            where('status', 'in', statuses),
        );

        const unsubscribe = onSnapshot(q, (qSnapshot: QuerySnapshot) => {
            const items: OrderedMenuItem[] = [];
            qSnapshot.forEach((doc) => {
                const orderId = doc.ref.parent?.parent?.id ?? '';
                items.push({
                    ...this.convertDocumentSnapshotToOrderMenuItem(doc),
                    id: doc.id,
                    orderId,
                });
            });
            onNext(items);
        });
        return { unsubscribe };
    }

    removeOrderItemFromOrder(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async updateOrderItemStatus(orderId: string, orderItemId: string, status: OrderedMenuItemStatus, updatedBy: string, date: Date = new Date()): Promise<void> {
        const ref = doc(this.db, this.parentCollectionName, orderId, this.collectionName, orderItemId);
        await updateDoc(ref, {
            status,
            updatedAt: date,
            updatedBy: 'ANONYMOUS_UPDATE',
        });
    }

    private convertDocumentSnapshotToOrderMenuItem(doc: DocumentSnapshot | DocumentData): OrderedMenuItem {
        const data = doc.data();
        return {
            ...data,
            createdAt: data?.createdAt?.toDate(),
            updatedAt: data?.updatedAt?.toDate(),
        };
    }

    private sortOrderItems(items: OrderedMenuItem[]): OrderedMenuItem[] {
        return items.sort((i1, i2) => {
            const i1Options = i1.options.map(option => option.choiceName).join('');
            const i2Options = i2.options.map(option => option.choiceName).join('');
            const i1Key = `${i1.categoryName}${i1.name}${i1Options}`
            const i2Key = `${i2.categoryName}${i1.name}${i2Options}`
            return i1Key.localeCompare(i2Key)
        });
    }
}

export const orderItemApi: OrderItemApi = new OrderItemApiImpl();