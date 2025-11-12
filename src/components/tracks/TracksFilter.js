import React from 'react';
import { Filter, Search } from 'lucide-react';

const baseInput = 'text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

const TracksFilter = ({ onFilterChange, currentFilters, categories, difficulties }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
        <Filter size={16} className="text-blue-600" />
        <span>Filter</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className={baseInput}
          value={currentFilters.category}
          onChange={(e) => onFilterChange({ ...currentFilters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories?.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className={baseInput}
          value={currentFilters.difficulty}
          onChange={(e) => onFilterChange({ ...currentFilters, difficulty: e.target.value })}
        >
          <option value="all">All Difficulties</option>
          {difficulties?.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <select
          className={baseInput}
          value={currentFilters.year}
          onChange={(e) => onFilterChange({ ...currentFilters, year: e.target.value })}
        >
          <option value="all">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracks..."
            className={`${baseInput} pl-9 w-full`}
            value={currentFilters.search}
            onChange={(e) => onFilterChange({ ...currentFilters, search: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default TracksFilter;
