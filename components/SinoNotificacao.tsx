'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

// Interface estrita para a Notificação
interface Notificacao {
  id: string;
  mensagem: string;
  data: string;
  tipo?: 'SUCESSO' | 'ALERTA'; // Definido conforme a lógica da movimentação
}

export default function SinoNotificacao() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carrega do localStorage apenas no lado do cliente
    const salvas = localStorage.getItem('maluma_notificacoes');
    if (salvas) {
      try {
        setNotificacoes(JSON.parse(salvas));
      } catch (e) {
        console.error("Erro ao parsear notificações", e);
      }
    }

    // Listener tipado para capturar o evento 'nova-notificacao'
    const handleNovaNotif = (e: Event) => {
      const customEvent = e as CustomEvent<Notificacao>;
      const nova = customEvent.detail;

      setNotificacoes(prev => {
        const atualizadas = [nova, ...prev];
        localStorage.setItem('maluma_notificacoes', JSON.stringify(atualizadas));
        return atualizadas;
      });
    };

    window.addEventListener('nova-notificacao', handleNovaNotif);
    return () => window.removeEventListener('nova-notificacao', handleNovaNotif);
  }, []);

  const limparNotificacoes = () => {
    setNotificacoes([]);
    localStorage.removeItem('maluma_notificacoes');
  };

  return (
    <div className="notif-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      
      {/* Modal que expande para cima */}
      {aberto && (
        <div ref={menuRef} className="notif-modal" style={{
          position: 'absolute', bottom: '60px', right: '0', width: '320px',
          background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>Notificações</span>
            <button 
              onClick={limparNotificacoes} 
              style={{ fontSize: '12px', color: '#db707a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Limpar tudo
            </button>
          </div>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notificacoes.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              notificacoes.map(n => (
                <div 
                  key={n.id} 
                  style={{ 
                    padding: '14px 16px', 
                    borderBottom: '1px solid #f5f5f5', 
                    display: 'flex', 
                    gap: '12px',
                    background: n.tipo === 'ALERTA' ? '#fff9f9' : 'white'
                  }}
                >
                  {/* Ícones baseados no tipo enviado pela movimentação */}
                  {n.tipo === 'ALERTA' ? (
                    <AlertTriangle size={18} color="#db707a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : n.tipo === 'SUCESSO' ? (
                    <CheckCircle2 size={18} color="#48bb78" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <Info size={18} color="#4a90e2" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.4', fontWeight: n.tipo === 'ALERTA' ? 500 : 400 }}>
                      {n.mensagem}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
                      {new Date(n.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Botão do Sino Flutuante */}
      <button 
        onClick={() => setAberto(!aberto)}
        style={{
          width: '52px', height: '52px', borderRadius: '50%', background: 'white',
          border: '1px solid #eee', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          position: 'relative', transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bell size={24} color="#333" strokeWidth={2} />
        
        {notificacoes.length > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px', background: '#db707a',
            color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px',
            padding: '0 4px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white'
          }}>
            {notificacoes.length}
          </span>
        )}
      </button>
    </div>
  );
}