import ResetPassword from '@/parts/auth/reset-password'
import React, { Suspense } from 'react'

const ResetPasswordPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading ...</div>}>
        <ResetPassword/>
      </Suspense>
    </div>
  )
}

export default ResetPasswordPage