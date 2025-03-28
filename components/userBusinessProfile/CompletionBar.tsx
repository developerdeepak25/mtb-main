import React from "react";

interface CompletionBarProps {
  percentage: number;
}

const CompletionBar: React.FC<CompletionBarProps> = ({ percentage }) => (
  <div className="relative w-3/4 mx-auto my-6">
    <div className="bg-gray-200 h-6 rounded">
      <div
        className="bg-blue-600 h-6 rounded transition-all"
        style={{ width: `${percentage || 0}%` }}
      ></div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-sm font-medium text-gray-800">
        {percentage || 0}%
      </span>
    </div>
  </div>
);

export default CompletionBar;
