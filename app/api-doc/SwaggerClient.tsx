'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p>Carregando documentação...</p>,
});

export default function SwaggerClient() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <SwaggerUI url="/api/swagger" />
    </div>
  );
}