'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AddCashForm } from '@/features/wallet/components'

export default function AddCashPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">กำลังโหลด...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <AddCashForm
          onSuccess={(data) => {
            console.log('Add cash success:', data)
            // สามารถเพิ่มการจัดการเมื่อสำเร็จ เช่น redirect หรือ refresh data
          }}
          onError={(error) => {
            console.error('Add cash error:', error)
          }}
        />
      </div>
    </div>
  )
}