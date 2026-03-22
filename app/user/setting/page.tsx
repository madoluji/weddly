import SettingsPage from '@/app/ui/user-component/usersettings'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <h1 className='text-4xl text-center mt-8 font-semibold'>Settings</h1>
    <Suspense fallback={<div>Loading...</div>}>
    <SettingsPage />
    </Suspense>
      
    </div>
  )
}

export default page