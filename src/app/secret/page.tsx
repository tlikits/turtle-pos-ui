'use client';

import { cartApi } from '../../api/cart';
import { orderApi } from '../../api/order';
import AuthGuard from '@/guards/auth-guard';

export default function SecretPage() {
    async function clearData(): Promise<void> {
        const isConfirm = confirm('ยืนยันการลบข้อมูลวันนี้')
        if (!isConfirm) {
            return
        }

        await orderApi.clearTodayOrder();
        await cartApi.clearCart();
        alert('ข้อมูลในวันนี้ถูกลบออกแล้ว');
    }

    return (
        <AuthGuard>
            <div className="btn-block">
                <button className="btn" onClick={ clearData }>ลบข้อมูลทั้งหมดในวันนี้</button>
            </div>
        </AuthGuard>
    )
}