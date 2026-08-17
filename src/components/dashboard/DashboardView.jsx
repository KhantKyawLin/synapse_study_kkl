import React, { useState, useMemo, useEffect } from 'react';
import DashboardToolbar from './DashboardToolbar';
import PathogenDetailGrid from './PathogenDetailGrid';
import rawDashboardData from '../../data/dashboards_data.json';

export default function DashboardView() {
  const modules = useMemo(() => Object.keys(rawDashboardData), []);
  const [selectedModule, setSelectedModule] = useState(modules[0] || 'Pathogens Database');

  const moduleItems = useMemo(() => {
    return rawDashboardData[selectedModule] || [];
  }, [selectedModule]);

  // Extract unique categories (Tag field)
  const categories = useMemo(() => {
    const set = new Set();
    moduleItems.forEach((item) => {
      if (item.Tag) set.add(item.Tag);
    });
    return Array.from(set).sort();
  }, [moduleItems]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return moduleItems;
    return moduleItems.filter((item) => item.Tag === selectedCategory);
  }, [moduleItems, selectedCategory]);

  const [selectedItem, setSelectedItem] = useState(filteredItems[0] || null);

  // Update selected item when module or category changes
  useEffect(() => {
    if (filteredItems.length > 0) {
      setSelectedItem(filteredItems[0]);
    } else {
      setSelectedItem(null);
    }
  }, [filteredItems]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <DashboardToolbar
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        items={filteredItems}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />

      <PathogenDetailGrid item={selectedItem} />
    </div>
  );
}
