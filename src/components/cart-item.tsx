import { CalculateType } from '@/api/model';
import { OrderedMenuItem, SelectedMenuOption } from '../api/order';

export interface CartItemProps {
    item: OrderedMenuItem;
    onRemove?: () => void;
}

function shouldShowOption(option: SelectedMenuOption): boolean {
    return option.calculateType !== CalculateType.BASE && !option.default;
}

function hasOptionPart(item: OrderedMenuItem): boolean {
    return item.options.some(shouldShowOption) || !!item.note;
}

export default function CartItem({ onRemove, item }: CartItemProps): JSX.Element {
    const baseOptionIdx = item.options.findIndex(option => option.calculateType === CalculateType.BASE);
    const baseOption = item.options[baseOptionIdx];
    const { price } = item;

    function renderOptionDescriptions() {
        if (!hasOptionPart(item)) {
            return undefined;
        }
        return (
            <div className="cart__options">
                { item.options.map(renderOptionDescription) }
                { item.note ? (<p>- โน๊ต • { item.note }</p>) : undefined }
            </div>
        )
    }

    function renderOptionDescription(option: SelectedMenuOption, idx: number): JSX.Element | undefined {
        if (!shouldShowOption(option)) {
            return undefined;
        }
        return (<p key={ idx }>- { option.nameTh } • { option.choiceNameTh }</p>);
    }

    return (
        <div className="cart">
            <div className="cart-main">
            {
                    item.status === 'PENDING' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'orange'}}></div> :
                        undefined
                }
                {
                    item.status === 'PREPARED' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'rgb(13 64 179)'}}></div> :
                        undefined
                }
                {
                    item.status === 'SERVED' ?
                        <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '4px', backgroundColor: 'green'}}></div> :
                        undefined
                }

                {/* <div className="cart__image-block">
                    <img className="cart__image" src={ item.imageUrl } alt={item.nameTh} />
                </div> */}
                <div className="cart__menu-description">
                    <span className="cart__menu-name">{ item.nameTh } - { baseOption.choiceNameTh }</span>
                    <span className="cart__menu-price">{ price }฿</span>
                </div>
            </div>
            {  renderOptionDescriptions() }
            { onRemove ? <button className="cart-close" onClick={ onRemove }></button> : undefined}
        </div>
    )
}