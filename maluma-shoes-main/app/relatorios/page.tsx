'use client';

// ============================================================
// RELATORIOS/PAGE.TSX
// Equivalente a: relatorios.html + relatorios.js
// ============================================================

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { relatoriosAPI } from '@/lib/api';

export default function RelatoriosPage() {
  // Estado da mensagem de feedback: null = oculto
  const [msg, setMsg] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  async function baixarRelatorio(tipo: string) {
    setMsg({ texto: 'Preparando download...', tipo: 'sucesso' });
    try {
      await relatoriosAPI.baixar(tipo);
      setMsg({ texto: '✅ Download iniciado com sucesso!', tipo: 'sucesso' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: unknown) {
      setMsg({
        texto: 'Erro ao gerar relatório: ' + (err instanceof Error ? err.message : 'Erro'),
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

        {msg && (
          <div className={msg.tipo === 'sucesso' ? 'msg-sucesso' : 'msg-erro'}>
            {msg.texto}
          </div>
        )}

        <div className="cards-grid">
          <div className="card card-relatorio">
            <span className="rel-icon">📊</span>
            <h3>Movimentações</h3>
            <p>Exportar histórico completo de movimentações de estoque em CSV.</p>
            <button
              className="btn-primary"
              onClick={() => baixarRelatorio('movimentacao')}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              📁 Baixar CSV
            </button>
          </div>

          <div className="card card-relatorio">
            <span className="rel-icon">⚠️</span>
            <h3>Abaixo do Mínimo</h3>
            <p>Exportar lista de calçados com estoque abaixo do mínimo em CSV.</p>
            <button
              className="btn-primary"
              onClick={() => baixarRelatorio('abaixo-estoque-minimo')}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              📁 Baixar CSV
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
