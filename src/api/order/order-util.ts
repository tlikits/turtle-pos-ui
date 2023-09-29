import { Order } from './types';

export class OrderUtils {
    public static getOrderTimeShortFormat(order: Order) {
        if (!order) {
            return '';
        }
        const { createdAt } = order;
        return this.getTimeShortFormat(createdAt);
    }

    public static getOrderTimeLongFormat(order: Order) {
        if (!order) {
            return '';
        }
        const { createdAt } = order;
        const hours = String(createdAt.getHours());
        const minutes = String(createdAt.getMinutes());
        const seconds = String(createdAt.getSeconds());
        return `${this.padTwoZero(hours)}.${this.padTwoZero(minutes)}.${this.padTwoZero(seconds)}`;
    }

    public static getTimeShortFormat(date: Date) {
        const hours = String(date.getHours());
        const minutes = String(date.getMinutes());
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    public static getTimeLongFormat(date: Date) {
        const hours = String(date.getHours());
        const minutes = String(date.getMinutes());
        const seconds = String(date.getSeconds());
        return `${this.padTwoZero(hours)}.${this.padTwoZero(minutes)}.${this.padTwoZero(seconds)}`;
    }

    public static padTwoZero(s: string) {
        return s.padStart(2, '0');
    }
}