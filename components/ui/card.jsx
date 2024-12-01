import React from 'react';

const Card = ({ title, value, className }) => {
  return (
    <div className={` shadow rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-2xl mt-2">{value}</p>
    </div>
  );
};

export default Card;
