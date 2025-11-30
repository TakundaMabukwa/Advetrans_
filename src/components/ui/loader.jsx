'use client'

import { useRouter } from 'next/navigation'
// components/PageLoader.js
import { useEffect, useState } from 'react'

import ClipLoader from 'react-spinners/ClipLoader'

const PageLoader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/70 z-50">
      <ClipLoader color="#000" size={50} />
    </div>
  )
}

export default PageLoader