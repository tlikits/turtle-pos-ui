import { CalculateType } from '@/api/model';
import { OrderedMenuItem, SelectedMenuOption } from '../api/order';
import { OrderUtils } from '../api/order/order-util';

export interface CartItemProps {
    item: OrderedMenuItem;
    itemNo: number;
    onRemove: () => void;
}

function shouldShowOption(option: SelectedMenuOption): boolean {
    return option.calculateType !== 'BASE' && option.calculateType !== CalculateType.NO && !option.default;
}

function hasOptionPart(item: OrderedMenuItem): boolean {
    return item.options.some(shouldShowOption);
}

export default function SummaryItem({ onRemove, item, itemNo }: CartItemProps): JSX.Element {
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
        <div className="cart" style={{ paddingTop: '12px' }}>
            <div style={{ position: 'absolute', top: '6px', fontSize: '12px'}}>{ itemNo }</div>
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
                <div className="cart__menu-description" style={ { flexDirection: 'row', justifyContent: 'space-between'} }>
                    <div className="cart__menu-name">{ item.nameTh } • { baseOption.choiceNameTh }</div>
                    <div className="cart__menu-price" style={ { marginTop: 0 } }>{ price }฿</div>
                </div>
            </div>
            <div style={{ fontSize: '12px', marginLeft: '12px' }}>{ OrderUtils.getTimeShortFormat(item.createdAt) }น.</div>
            {  renderOptionDescriptions() }
        </div>
    )
}