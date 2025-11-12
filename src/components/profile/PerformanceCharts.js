import React from 'react';

const PerformanceCharts = ({ analytics }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Performance Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Problem Solving Trends</h3>
          <div className="h-40 flex items-center justify-center text-gray-500">Chart Placeholder</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Topic-wise Accuracy</h3>
          <div className="h-40 flex items-center justify-center text-gray-500">Chart Placeholder</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Contest Performance</h3>
          <div className="h-40 flex items-center justify-center text-gray-500">Chart Placeholder</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Study Pattern Heatmap</h3>
          <div className="h-40 flex items-center justify-center text-gray-500">Chart Placeholder</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
