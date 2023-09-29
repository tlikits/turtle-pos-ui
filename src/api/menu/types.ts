import { MenuItem } from '../model';

export interface MenuApi {
    getCategories(): Promise<string[]>;
    getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
}
