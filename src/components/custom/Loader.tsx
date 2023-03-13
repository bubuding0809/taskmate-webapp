import React from "react";

interface LoaderProps {}

const Loader: React.FC<LoaderProps> = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-700">Loading...</h1>
    </div>
  );
};

export default Loader;
