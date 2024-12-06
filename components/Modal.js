import React from 'react';

const Modal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className=" p-4 rounded-lg  w-1/3 bg-[#dbd9db]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm">Add Subcription</h2>
          <button onClick={onClose} className="text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
