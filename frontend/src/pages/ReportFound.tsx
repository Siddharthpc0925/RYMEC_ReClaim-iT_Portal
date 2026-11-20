import React, { useState, useEffect } from 'react';
import { ItemForm } from '../components/items/ItemForm';
import { api } from '../lib/api';
import { Location } from '../types';

interface ReportFoundProps {
  navigate: (route: string) => void;
}

export const ReportFound: React.FC<ReportFoundProps> = ({ navigate }) => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    api.getLocations().then((res) => setLocations(res.locations || [])).catch(() => {});
  }, []);

  const handleSubmit = async (data: any) => {
    await api.createItem({
      ...data,
      type: 'FOUND',
      colour: data.colour || data.color || 'Not specified',
      occurred_at: data.occurred_at || data.event_time,
      location_other: data.location_other || data.location_spot
    });
    navigate('/my-items');
  };

  return <ItemForm kind="found" onSubmit={handleSubmit} locations={locations} />;
};
