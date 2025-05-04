import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

// Business hours configuration
const businessHours = {
  'Segunda-feira': { open: '11:00', close: '22:00' },
  'Terça-feira': { open: '11:00', close: '22:00' },
  'Quarta-feira': { open: '11:00', close: '22:00' },
  'Quinta-feira': { open: '11:00', close: '22:00' },
  'Sexta-feira': { open: '11:00', close: '23:00' },
  'Sábado': { open: '11:00', close: '23:00' },
  'Domingo': { open: '11:00', close: '20:00' }
};

export function BusinessHours() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date())
    .charAt(0).toUpperCase() + new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()).slice(1);
  
  const todayHours = businessHours[today as keyof typeof businessHours];
  const isOpen = checkIfOpen(todayHours);

  function checkIfOpen(hours: { open: string; close: string }): boolean {
    if (!hours) return false;
    
    const now = new Date();
    
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    
    const open = new Date();
    open.setHours(openHour, openMinute, 0);
    
    const close = new Date();
    close.setHours(closeHour, closeMinute, 0);
    
    return now >= open && now <= close;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showTooltip && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      setTooltipPosition({
        top: buttonRect.bottom + scrollY + 8,
        left: Math.max(16, buttonRect.right - 256) // 256px is tooltip width
      });
    }
  }, [showTooltip]);

  const tooltip = showTooltip && createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
        onClick={() => setShowTooltip(false)}
      />
      <div
        ref={tooltipRef}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`
        }}
        className="fixed w-64 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-[9999] overflow-hidden"
      >
        <div className="p-4">
          <h3 className="text-sm font-medium text-[#FF4500] mb-3">Horário de Funcionamento</h3>
          <div className="space-y-2">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className={day === today ? 'font-medium text-[#FF4500]' : 'text-gray-400'}>
                  {day}
                </span>
                <span className={day === today ? 'font-medium text-[#FF4500]' : 'text-gray-500'}>
                  {hours.open} - {hours.close}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-400">
                {isOpen ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label={isOpen ? 'Aberto Agora' : 'Fechado'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
          isOpen ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'bg-gray-800/30 text-gray-400'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isOpen ? 'Aberto Agora' : 'Fechado'}</span>
        <span className="text-xs opacity-75 hidden md:inline">• {todayHours.open} - {todayHours.close}</span>
      </button>

      {tooltip}
    </div>
  );
}