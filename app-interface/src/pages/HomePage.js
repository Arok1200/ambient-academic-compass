import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';

function HomePage() {
  const { loadData } = useData();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <h2>Welcome to Ambient Academic Compass</h2>
      <p>Select a tab above to get started.</p>
    </div>
  );
}

export default HomePage;
