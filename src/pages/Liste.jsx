import React from 'react';
import { useParams } from 'react-router-dom';
import MainPage from './MainPage';

export default function Liste() {
  const params = useParams();
  const listName = params?.name ? decodeURIComponent(params.name) : 'General';

  return <MainPage listName={listName} title={listName} />;
}

