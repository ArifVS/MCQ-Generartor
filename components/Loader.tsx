
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    <p className="text-lg text-slate-300">{message}</p>
  </div>
);

export default Loader;
