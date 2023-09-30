import { menus } from './pos-menus';
import { MenuItem } from '../model';
import { MenuApi } from './types';

export class MenuApiImpl implements MenuApi {
    public async getCategories(): Promise<string[]> {
        const categoriesInMenu = menus.map(menu => menu.categoryName);
        const set = new Set(categoriesInMenu);
        return Array.from(set);

    }
    public async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
        return menus.filter(menu => menu.categoryName === category);
    }
}

export const menuApi = new MenuApiImpl();
