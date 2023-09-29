export type MenuOption = SingleMenuOption | MultipleMenuOption;

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
    calculateType: 'BASE' | 'ADDITIONAL' | 'NO';
    choices: MenuSelectChoice[];
}

export interface MultipleMenuOption {
    id: string;
    type: 'MULTIPLE';
    name: string;
    nameTh: string;
    calculateType: 'BASE' | 'ADDITIONAL' | 'NO';
    choices: MenuSelectChoice[];
}

export interface MenuItem {
    id: string;
    name: string;
    nameTh: string;
    categoryName: string;
    basePrice: number;
    options: MenuOption[];
}

export interface Category {
    id: string;
    name: string;
}
