/* DONE BY: Ding RuoQian 2100971 */

import React from "react";

interface LoaderProps {
  children?: React.ReactNode;
}

const Loader: React.FC<LoaderProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-700">Loading...</h1>
      {children}
    </div>
  );
};

export default Loader;
