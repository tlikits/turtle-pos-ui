import { useState } from 'react';
import { BaristaHelper } from '../api/barista-helper';
import { MenuItem, MenuOption, MenuSelectChoice } from '../api/model';
import { OrderedMenuItem } from '../api/order';



export interface AddItemPanelProps {
    onAddToCart: (orderedMenuItem: OrderedMenuItem) => Promise<void>;
    onClose: () => Promise<void>;
    menuItem: MenuItem;
}

export default function AddItemPanel({ onAddToCart, onClose, menuItem }: AddItemPanelProps): JSX.Element {
    const [selectedChoices, setSelectedChoice] = useState(generateSelectedChoices(menuItem))
    const [note, setNote] = useState('');

    function generateSelectedChoices(menuItem: MenuItem): number[] {
        const { options } = menuItem;
        const result = options.map(option => {
            const { choices } = option;
            const idx = choices.findIndex(choice => choice.default);
            return idx;
        });
        return result;

    }

    function addToCart() {
        onAddToCart(BaristaHelper.generateOrderedMenuItem(menuItem, selectedChoices, note));
    }

    function setChoice(optionIdx: number, choiceIdx: number) {
        selectedChoices[optionIdx] = choiceIdx;
        setSelectedChoice([...selectedChoices]);
    }

    function renderChoice(option: MenuOption, optionIdx: number, choice: MenuSelectChoice, choiceIdx: number) {
        return (
            <label
                key={ choiceIdx }
                className={ selectedChoices[optionIdx] === choiceIdx ? 'menu-option-block__option menu-option-block__option--active' : 'menu-option-block__option' }
                onClick={ () => setChoice(optionIdx, choiceIdx) }
            >
                { choice.nameTh }{ option.calculateType !== 'NO' ? ` ${option.calculateType === 'ADDITIONAL' ? '+' : ''}${choice.price}฿` : '' }
            </label>
        )
    }

    return (
        <div className="add-item-container" onClick={ onClose }>
            <div className="add-item-panel" onClick={ (e) => e.stopPropagation() }>
                <button className="add-item-panel__close" onClick={ onClose }></button>
                <span className="add-item-panel__name">{ menuItem.nameTh }</span>
                <img className="add-item-panel__image" src={ menuItem.imageUrl } alt={menuItem.nameTh}  />
                <span className="add-item-panel__current-price">{ menuItem.basePrice }฿</span>
                {
                    menuItem.options.map((option, optionIdx) => (
                        option.choices.length === 1 ?
                            undefined :
                            (
                                <div key={ optionIdx } className="menu-option-block">
                                    <div className="menu-option-block__title">{ option.nameTh }</div>
                                    <div className="menu-option-block__option-block">
                                        {
                                            option.choices.map((choice, choiceIdx) => renderChoice(option, optionIdx, choice, choiceIdx))
                                        }
                                    </div>
                                </div>
                            )
                    ))
                }
                <div className="menu-option-block">
                    <div className="menu-option-block__title">โน๊ต</div>
                    <textarea className="menu-option-block__text" name="menu-note" onChange={ (e) => setNote(e.target.value) }></textarea>
                </div>
                <div className="float-btn-block">
                    <button className="add-submit-btn" onClick={ addToCart }>เพิ่มรายการ</button>
                </div>
            </div>
        </div>
    )
}