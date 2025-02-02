import React from 'react';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Modal = ({ 
  onClose, 
  children, 
  // title = "Add Subscription",
  title = "",

  size = "default" // can be "sm", "default", "lg", "xl", or "full"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Define size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100%-2rem)]'
  };

  return (
    <div 
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 
        flex items-center justify-center transition-opacity duration-200
        px-4 py-6 sm:px-6 sm:py-8 md:p-12
        overflow-y-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-foreground text-card-foreground border shadow-lg rounded-lg 
          w-full ${sizeClasses[size]}
          transform transition-all duration-200
          mx-auto my-auto
          flex flex-col max-h-[calc(100vh-2rem)]
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex items-center justify-between p-2 pb-0 sm:pt-4 sm:pr-4 sm:pb-0 border-b">
          <h2 className="text-base sm:text-lg font-semibold truncate">{title}</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-background hover:text-foreground" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;