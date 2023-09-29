'use client';

import { useState } from 'react';
import styles from './page.module.css'


export default function QuickAddPage() {
    const [availableNumberList, setAvailableNumberList] = useState([20, 25, 30, 35, 40, 45])
    const [numberList, setNumberList] = useState([] as number[]);
    const [totalNumber, setTotalNumber] = useState(0);
    const [sumResult, setSumResult] = useState(0);
    const [sumText, setSumText] = useState('0');
    const [numberCounterList, setNumberCounterList] = useState(calculateNumberCounterList(availableNumberList, numberList));

    function formatNumberToText(num: number): string {
        return num.toLocaleString("en-US")
    }

    function addToList(e: React.MouseEvent<HTMLElement>) {
        const element = e.target as HTMLButtonElement;
        const value = element.getAttribute('value');
        if (!Number.isNaN(value)) {
            numberList.push(Number(value))
            setNumberListState(numberList)
        }
    }

    function popList() {
        numberList.pop()
        setNumberListState(numberList)
    }

    function calculateNumberCounterList(availableNumberList: number[], numberList: number[]) {
        const mapper = availableNumberList.reduce((prev, curr) => {
            prev[curr] = 0;
            return prev
        }, {} as { [key: number]: number })
        for (const no of numberList) {
            if (availableNumberList.includes(no)) {
                mapper[no]++;
            }
        }
        return mapper;
    }

    function calculateSumResult() {
        return numberList.reduce((prev, curr) => {
            return prev + curr
        }, 0)
    }

    function calculateSumText() {
        if (numberList.length === 0) {
            return '0';
        }
        return numberList.join(' + ');
    }

    function renderAddNumberButton(number: number) {
        return (
            <button key={number} className={styles.gridBox} value={number} onClick={addToList}>
                {number}
                <span className={styles.gridBoxCounter}>{numberCounterList[number]}</span>
            </button>
        )
    }

    function setNumberListState(numberList: number[]) {
        setNumberList(numberList);
        setTotalNumber(numberList.length);
        setSumResult(calculateSumResult());
        setSumText(calculateSumText());
        setNumberCounterList(calculateNumberCounterList(availableNumberList, numberList));
    }

    return (
        <div className={styles.outer}>
            <div className={styles.displayBlock}>
                <div className={styles.displayText}>
                    <div className={styles.addingList}>{sumText}</div>
                    <div className={styles.total}>= {formatNumberToText(sumResult)} ({formatNumberToText(totalNumber)} items)</div>
                </div>
                <button className={styles.removeAction} onClick={popList}>Del</button>
            </div>
            <div className={styles.gridBlock}>
                {
                    availableNumberList.map(renderAddNumberButton)
                }
            </div>
        </div>
    )
}