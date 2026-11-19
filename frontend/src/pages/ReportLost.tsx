import React, { useState, useEffect } from 'react';
import { ItemForm } from '../components/items/ItemForm';
import { api } from '../lib/api';
import { Location } from '../types';

interface ReportLostProps {
  navigate: (route: string) => void;
}

export const ReportLost: React.FC<ReportLostProps> = ({ navigate }) => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    api.getLocations().then((res) => setLocations(res.locations || [])).catch(() => {});
  }, []);

  const handleSubmit = async (data: any) => {
    await api.createItem(data);
    navigate('/');
  };

  return <ItemForm kind="lost" onSubmit={handleSubmit} locations={locations} />;
};
