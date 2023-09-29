import { MenuItem, MenuOption } from './model';
import { NewOrder, Order, OrderedMenuItem, PaymentMethod, SelectedMenuOption } from './order';

export class BaristaHelper {
    public static calculateTotalPriceFromOrder(order: NewOrder | Order): number {
        if (order.paymentMethod === PaymentMethod.FREE) {
            return 0;
        }
        const { items = [] } = order;
        return items.reduce((total, item) => {
            return total + item.price;
        }, 0)
    }

    public static calculatePrice(item: MenuItem, selectedMenuOptions: SelectedMenuOption[]): number {
        const baseIdx = selectedMenuOptions.findIndex(option => option.calculateType === 'BASE');
        const basePrice = baseIdx >= 0 ? selectedMenuOptions[baseIdx].price : item.basePrice;
        const additionalPrice = selectedMenuOptions.reduce((totalAdd, option) => {
            if (option.calculateType === 'ADDITIONAL') {
                return totalAdd + option.price;
            }
            return totalAdd;
        }, 0)
        return basePrice + additionalPrice;
    }

    public static generateOrderedMenuItem(
        menuItem: MenuItem,
        selectedChoiceIndices: number[],
        note: string = ''
    ): OrderedMenuItem {
        const { options, basePrice, ...extractedProps} = menuItem;
        const selectedMenuOptions = options.map((option, idx) => BaristaHelper.generateSelectedMenuOption(option, selectedChoiceIndices[idx]))
        const now = new Date();
        return {
            ...extractedProps,
            basePrice: BaristaHelper.calculatePrice(menuItem, selectedMenuOptions),
            price: BaristaHelper.calculatePrice(menuItem, selectedMenuOptions),
            options: selectedMenuOptions,
            note,
            status: 'PENDING',
            createdAt: now,
            updatedAt: now,
        } as OrderedMenuItem;
    }

    public static generateSelectedMenuOption(option: MenuOption, choiceIdx: number): SelectedMenuOption {
        const { choices } = option;
        const selectedChoice = choices[choiceIdx];
        return {
            id: option.id,
            name: option.name,
            nameTh: option.nameTh,
            calculateType: option.calculateType,
            choiceName: selectedChoice.name,
            choiceNameTh: selectedChoice.nameTh,
            price: selectedChoice.price,
            default: selectedChoice.default,
        };
    }
}