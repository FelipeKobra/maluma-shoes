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
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Relatórios</h1>
        </div>

        {/* Feedback de Mensagem Padronizado */}
        {msg && (
          <div 
            className={msg.tipo === 'sucesso' ? 'msg-sucesso' : 'msg-erro'}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
          >
            {msg.tipo === 'processando' && <Loader2 className="animate-spin" size={18} />}
            {msg.tipo === 'sucesso' && <CheckCircle2 size={18} />}
            {msg.tipo === 'erro' && <XCircle size={18} />}
            {msg.texto}
          </div>
        )}

        <div className="cards-grid">
          {/* Relatório de Movimentações */}
          <div className="card card-relatorio" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card-title">
              <BarChart3 size={24} strokeWidth={2.5} />
              <h3>Movimentações</h3>
            </div>
            <p>Exportar histórico completo de movimentações de estoque em CSV.</p>
            <button
              className="btn-primary"
              onClick={() => baixarRelatorio('movimentacao')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto' }}
              disabled={msg?.tipo === 'processando'}
            >
              <FileDown size={18} /> Baixar CSV
            </button>
          </div>

          {/* Relatório de Estoque Baixo */}
          <div className="card card-relatorio" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card-title">
              <AlertTriangle size={24} strokeWidth={2.5} />
              <h3>Abaixo do Mínimo</h3>
            </div>
            <p>Exportar lista de calçados com estoque abaixo do mínimo em CSV.</p>
            <button
              className="btn-primary"
              onClick={() => baixarRelatorio('abaixo-estoque-minimo')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto' }}
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