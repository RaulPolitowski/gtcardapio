import React, { useState } from 'react';
import { MessageSquare, Clock, Settings as SettingsIcon, X } from 'lucide-react';
import { SystemSettings } from '../types';

interface AdminSettingsProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
  onClose: () => void;
}

export function AdminSettings({ settings, onSave, onClose }: AdminSettingsProps) {
  const [currentTab, setCurrentTab] = useState<'whatsapp' | 'store'>('whatsapp');
  const [currentSettings, setCurrentSettings] = useState(settings);

  const handleSave = () => {
    onSave(currentSettings);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Configurações do Sistema</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentTab('whatsapp')}
              className={`px-4 py-2 border-b-2 transition-colors duration-300 ${
                currentTab === 'whatsapp'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('store')}
              className={`px-4 py-2 border-b-2 transition-colors duration-300 ${
                currentTab === 'store'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Loja
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {currentTab === 'whatsapp' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações do WhatsApp</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={currentSettings.whatsApp.number}
                    onChange={e => setCurrentSettings(prev => ({
                      ...prev,
                      whatsApp: { ...prev.whatsApp, number: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Digite o número com código do país e DDD, sem espaços ou caracteres especiais
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem do Pedido
                  </label>
                  <p className="text-sm text-gray-600 mb-2">
                    Variáveis disponíveis:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-2">
                    <li><code>{`{items}`}</code> - Lista de itens do pedido</li>
                    <li><code>{`{total}`}</code> - Valor total do pedido</li>
                    <li><code>{`{customerName}`}</code> - Nome do cliente</li>
                    <li><code>{`{orderNumber}`}</code> - Número do pedido</li>
                  </ul>
                  <textarea
                    value={currentSettings.whatsApp.messageTemplate}
                    onChange={e => setCurrentSettings(prev => ({
                      ...prev,
                      whatsApp: { ...prev.whatsApp, messageTemplate: e.target.value }
                    }))}
                    className="w-full h-48 p-4 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 font-mono text-sm"
                    placeholder="Digite a mensagem..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'store' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurações da Loja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtítulo da Loja
                  </label>
                  <input
                    type="text"
                    value={currentSettings.store.subtitle}
                    onChange={e => setCurrentSettings(prev => ({
                      ...prev,
                      store: { ...prev.store, subtitle: e.target.value }
                    }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Funcionamento
                  </label>
                  <div className="space-y-3">
                    {Object.entries(currentSettings.store.businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-32 text-sm">{day}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={e => setCurrentSettings(prev => ({
                              ...prev,
                              store: {
                                ...prev.store,
                                businessHours: {
                                  ...prev.store.businessHours,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              }
                            }))}
                            className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                          <span>até</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={e => setCurrentSettings(prev => ({
                              ...prev,
                              store: {
                                ...prev.store,
                                businessHours: {
                                  ...prev.store.businessHours,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              }
                            }))}
                            className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.closed}
                              onChange={e => setCurrentSettings(prev => ({
                                ...prev,
                                store: {
                                  ...prev.store,
                                  businessHours: {
                                    ...prev.store.businessHours,
                                    [day]: { ...hours, closed: e.target.checked }
                                  }
                                }
                              }))}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-600">Fechado</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datas Especiais
                  </label>
                  <div className="space-y-4">
                    {currentSettings.store.specialDates.map((date, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-4">
                            <input
                              type="date"
                              value={date.date}
                              onChange={e => {
                                const newDates = [...currentSettings.store.specialDates];
                                newDates[index] = { ...date, date: e.target.value };
                                setCurrentSettings(prev => ({
                                  ...prev,
                                  store: { ...prev.store, specialDates: newDates }
                                }));
                              }}
                              className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={date.description}
                              onChange={e => {
                                const newDates = [...currentSettings.store.specialDates];
                                newDates[index] = { ...date, description: e.target.value };
                                setCurrentSettings(prev => ({
                                  ...prev,
                                  store: { ...prev.store, specialDates: newDates }
                                }));
                              }}
                              placeholder="Descrição (ex: Feriado)"
                              className="flex-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={date.open}
                                onChange={e => {
                                  const newDates = [...currentSettings.store.specialDates];
                                  newDates[index] = { ...date, open: e.target.value };
                                  setCurrentSettings(prev => ({
                                    ...prev,
                                    store: { ...prev.store, specialDates: newDates }
                                  }));
                                }}
                                className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                              />
                              <span>até</span>
                              <input
                                type="time"
                                value={date.close}
                                onChange={e => {
                                  const newDates = [...currentSettings.store.specialDates];
                                  newDates[index] = { ...date, close: e.target.value };
                                  setCurrentSettings(prev => ({
                                    ...prev,
                                    store: { ...prev.store, specialDates: newDates }
                                  }));
                                }}
                                className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                              />
                            </div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={date.closed}
                                onChange={e => {
                                  const newDates = [...currentSettings.store.specialDates];
                                  newDates[index] = { ...date, closed: e.target.checked };
                                  setCurrentSettings(prev => ({
                                    ...prev,
                                    store: { ...prev.store, specialDates: newDates }
                                  }));
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-600">Fechado</span>
                            </label>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDates = currentSettings.store.specialDates.filter((_, i) => i !== index);
                            setCurrentSettings(prev => ({
                              ...prev,
                              store: { ...prev.store, specialDates: newDates }
                            }));
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newDate = {
                          date: new Date().toISOString().split('T')[0],
                          open: '09:00',
                          close: '18:00',
                          description: '',
                          closed: false
                        };
                        setCurrentSettings(prev => ({
                          ...prev,
                          store: {
                            ...prev.store,
                            specialDates: [...prev.store.specialDates, newDate]
                          }
                        }));
                      }}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                    >
                      Adicionar Data Especial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}