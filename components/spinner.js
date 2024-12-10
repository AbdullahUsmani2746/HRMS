import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-[65vh]">
      <div className="w-16 h-16 border-4 border-t-4 border-foreground border-dotted rounded-full animate-spin"></div>
    </div>
  )
}

export default LoadingSpinner