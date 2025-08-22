'use client'

import { useAddCashToTrade } from '../hooks/useAddCashToTrade'

interface AddCashFormProps {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export const AddCashForm = ({ onSuccess, onError }: AddCashFormProps) => {
  const addCashMutation = useAddCashToTrade({
    onSuccess: (data) => {
      alert(`เพิ่มเงินสำเร็จ: 10,000 บาท`)
      onSuccess?.(data)
    },
    onError: (error) => {
      alert(`เกิดข้อผิดพลาด: ${error.message}`)
      onError?.(error)
    },
  })

  const handleAddCash = () => {
    addCashMutation.mutate()
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">เพิ่มเงินเข้าระบบ</h2>
      
      <div className="text-center space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-lg font-semibold text-blue-800 mb-2">จำนวนเงินที่จะได้รับ</p>
          <p className="text-3xl font-bold text-blue-600">10,000 บาท</p>
        </div>

        <p className="text-gray-600 text-sm">
          คลิกปุ่มด้านล่างเพื่อเพิ่มเงิน 10,000 บาทเข้าสู่บัญชีของคุณ
        </p>

        <button
          onClick={handleAddCash}
          disabled={addCashMutation.isPending}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
        >
          {addCashMutation.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>กำลังประมวลผล...</span>
            </div>
          ) : (
            'เพิ่มเงิน 10,000 บาท'
          )}
        </button>

        {addCashMutation.isError && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-800 text-sm">
              เกิดข้อผิดพลาด: {addCashMutation.error?.message}
            </p>
          </div>
        )}

        {addCashMutation.isSuccess && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              ✅ เพิ่มเงินสำเร็จแล้ว!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

