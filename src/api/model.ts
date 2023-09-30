export type MenuOption = SingleMenuOption | MultipleMenuOption;

export enum CalculateType {
    BASE = 'BASE',
    ADDITIONAL = 'ADDITIONAL',
    NO = 'NO',
}

export interface MenuSelectChoice {
    id: string;
    name: string;
    nameTh: string;
    price: number;
    default: boolean;
}

export interface SingleMenuOption {
    id: string;
    type: 'SINGLE';
    name: string;
    nameTh: string;
    calculateType: CalculateType;
    choices: MenuSelectChoice[];
}

export interface MultipleMenuOption {
    id: string;
    type: 'MULTIPLE';
    name: string;
    nameTh: string;
    calculateType: CalculateType;
    choices: MenuSelectChoice[];
}

export interface MenuItem {
    id: string;
    name: string;
    nameTh: string;
    categoryName: string;
    imageUrl?: string;
    basePrice: number;
    options: MenuOption[];
}

export interface Category {
    id: string;
    name: string;
}


// interface MenuAndOptionSelector

// export interface SelectedMenuOption {
//     id: string;
//     name: string;
//     nameTh: string;
//     calculateType: CalculateType;
//     choiceName: string;
//     choiceNameTh: string;
//     price: number;
//     default: boolean; // true if the option choice is default one
// }


// export type OrderedMenuItemStatus = 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELED';

// export interface OrderedMenuItem extends Omit<MenuItem, 'options' | 'basePrice'> {
//     price: number;
//     options: SelectedMenuOption[];
//     note: string;
//     status: OrderedMenuItemStatus;
// }

// export type OrderStatus = 'PENDING' | 'ORDER_PLACED' | 'PREPARING' | 'PREPARED' | 'SERVED' | 'CANCELED';
// export type PaymentOption = 'CASH' | 'TRANSFER' | 'FREE';

// export interface Order {
//     id: number;
//     items: OrderedMenuItem[];
//     status: OrderStatus;
//     note: string;
//     createdAt: Date;
//     updatedAt: Date;
// }

// export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

// export interface OrderFirestore extends Omit<Order, 'createdAt' | 'updatedAt'> {
//     createdAt: Timestamp;
//     updatedAt: Timestamp;
// }
