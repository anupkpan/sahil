import React from "react";

type Props = {
  shayari: string;
  source: string;
  isLoading: boolean;
};

const ShayariDisplay = ({ shayari, source, isLoading }: Props) => {
  return (
    <div className="mt-6 p-6 bg-black/30 backdrop-blur-md rounded-2xl max-w-2xl w-full mx-auto text-center shadow-lg border border-white/10 relative transition-all duration-500 ease-in-out transform scale-100 opacity-100">
      {isLoading ? (
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mb-3"></div>
      ) : (
        <p className="text-xl md:text-2xl leading-loose text-white font-hindi whitespace-pre-line text-shadow-md">
          {shayari}
        </p>
      )}
      {source && <div className="mt-2 text-sm text-gray-500">Source: {source}</div>}
    </div>
  );
};

export default ShayariDisplay;
