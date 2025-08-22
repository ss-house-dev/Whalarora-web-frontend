import axiosInstance from '@/lib/axios'
import { AddCashResponse } from '../types'

const addCashToTrade = async (): Promise<AddCashResponse> => {
  try {
    // API ไม่ต้องการ body ใดๆ จะเพิ่มเงิน 10,000 อัตโนมัติ
    const { data } = await axiosInstance.post('/trade/add-cash')
    
    // ถ้า response เป็น string หรือไม่มี structure ที่คาดหวัง ให้สร้าง response object
    if (typeof data === 'string' || !data) {
      return {
        success: true,
        message: 'เพิ่มเงิน 10,000 บาทสำเร็จ',
        data: {
          amount: 10000
        }
      }
    }
    
    return data
  } catch (error: any) {
    console.error('Add cash error:', error)
    
    if (error?.response?.status === 401) {
      throw new Error('กรุณาเข้าสู่ระบบใหม่')
    }
    
    const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มเงิน'
    throw new Error(errorMessage)
  }
}

export default addCashToTrade
export type { AddCashResponse }