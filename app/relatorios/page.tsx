'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { relatoriosAPI } from '@/lib/api';
// Importação dos ícones para os cards e botões
import { 
  BarChart3, 
  AlertTriangle, 
  FileDown, 
  CheckCircle2, 
  XCircle,
  Loader2 
} from 'lucide-react';

export default function RelatoriosPage() {
  const [msg, setMsg] = useState<{ texto: string; tipo: 'sucesso' | 'erro' | 'processando' } | null>(null);

  async function baixarRelatorio(tipo: string) {
    setMsg({ texto: 'Preparando download...', tipo: 'processando' });
    try {
      await relatoriosAPI.baixar(tipo);
      setMsg({ texto: 'Download iniciado com sucesso!', tipo: 'sucesso' });
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg({
        texto: 'Erro ao gerar relatório: ' + (err instanceof Error ? err.message : 'Erro inesperado'),
        tipo: 'erro',
      });
    }
  }

  return (
    <div className="layout flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="main flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="page-header mb-6">
          <h1 className="page-title text-2xl font-bold">Relatórios</h1>
        </div>

        {/* Feedback de Mensagem Padronizado */}
        {msg && (
          <div 
            className={msg.tipo === 'sucesso' ? 'msg-sucesso' : 'msg-erro'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '20px',
              padding: '12px',
              borderRadius: '8px' 
            }}
          >
            {msg.tipo === 'processando' && <Loader2 className="animate-spin" size={18} />}
            {msg.tipo === 'sucesso' && <CheckCircle2 size={18} />}
            {msg.tipo === 'erro' && <XCircle size={18} />}
            <span style={{ fontSize: '14px' }}>{msg.texto}</span>
          </div>
        )}

        {/* Grid Responsivo: 1 coluna no mobile, 2 colunas em telas maiores */}
        <div className="cards-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          

          {/* Relatório de Estoque Baixo */}
          <div className="card card-relatorio" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} strokeWidth={2.5} />
              <h3 className="font-bold text-lg">Abaixo do Mínimo</h3>
            </div>
            <p className="text-gray-600 text-sm">Exportar lista de calçados com estoque abaixo do mínimo em CSV.</p>
            <button
              className="btn-primary w-full"
              onClick={() => baixarRelatorio('abaixo-estoque-minimo')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto', padding: '10px' }}
              disabled={msg?.tipo === 'processando'}
            >
              <FileDown size={18} /> Baixar CSV
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}