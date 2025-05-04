import React, { useState } from 'react';
import { LogIn, User, Lock, ChevronRight, Mail, Phone, MapPin, X, AlertCircle } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { Customer } from '../types';
import { useEffect } from 'react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: Customer | null) => void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    cpf: '',
    password: '',
    name: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Ensure Google Client ID is set
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      setError('Configuração do Google Login não está disponível');
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsGoogleLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        throw new Error('No credentials received');
      }

      // Decode the JWT token
      const decoded: any = jwtDecode(credentialResponse.credential);

      // Create user from Google data
      const user: Customer = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        phone: '',
        photoUrl: decoded.picture,
        favorites: []
      };

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Erro ao fazer login com Google. Por favor, tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validate digits
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/g, '($1) $2-$3');
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const isAdminLogin = (identifier: string) => {
    return identifier.toLowerCase() === 'admin@admin.com' || 
           identifier.toLowerCase() === 'admin@admin.com.br';
  };

  const handleLogin = () => {
    const identifier = formData.email || formData.phone || formData.cpf;
    
    if ((identifier === 'admin@admin.com' || identifier === 'admin@admin.com.br') && formData.password === 'admin') {
      const user: Customer = {
        id: 'admin123',
        name: 'Administrador',
        email: 'admin@admin.com',
        cpf: '',
        phone: '',
        favorites: [],
        isAdmin: true
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
    } else {
      setError('Credenciais inválidas');
    }
  };

  const handleRegister = () => {
    if (isAdminLogin(formData.email)) {
      setError('Este email não pode ser utilizado para registro');
      return;
    }

    const newUser: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
      phone: formData.phone,
      address: formData.address,
      favorites: []
    };
    onLogin(newUser);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const isAdminAttempt = formData.email === 'admin@admin.com' || formData.email === 'admin@admin.com.br';
    
    if (isRegistering) {
      // CPF validation (required for registration)
      if (!formData.cpf) {
        errors.cpf = 'CPF é obrigatório';
      } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
        errors.cpf = 'CPF inválido';
      } else if (!validateCPF(formData.cpf)) {
        errors.cpf = 'CPF inválido';
      }

      // Email validation
      if (!formData.email) {
        errors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email inválido';
      }

      // Name validation
      if (!formData.name) {
        errors.name = 'Nome é obrigatório';
      }

      // Phone validation
      if (!formData.phone) {
        errors.phone = 'Telefone é obrigatório';
      } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Telefone inválido';
      }
    } else {
      // Login validation - at least one identifier is required
      if (!formData.email && !formData.phone && !formData.cpf) {
        errors.identifier = 'Informe email, telefone ou CPF';
      }
    }

    // Password validation
    if (!isAdminAttempt && !formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (!isAdminAttempt && formData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (isRegistering) {
        handleRegister();
      } else {
        handleLogin();
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-light rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-title font-bold">
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Google Login */}
          <div className="mb-6">
            <GoogleLogin
              auto_select={false}
              type="standard"
              ux_mode="popup"
              context="signin"
              itp_support={true}
              cancel_on_tap_outside={true}
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Não foi possível fazer login com Google. Por favor, tente novamente ou use outro método de login.');
              }}
              theme="outline"
              size="large"
              shape="rectangular"
              width="100%"
              text={isRegistering ? "continue_with" : "signin_with"}
              disabled={isGoogleLoading}
            />
            {isGoogleLoading && (
              <div className="mt-2 text-center">
                <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card-light text-gray-400">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-500/50 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Erro ao processar solicitação</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="form-label">CPF</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    maxLength={14}
                    className={`form-input pl-10 ${validationErrors.cpf ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder="Digite seu CPF"
                  />
                  {validationErrors.cpf && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.cpf}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="form-label">
                {isRegistering ? 'Email' : 'Email, Telefone ou CPF'}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`form-input w-full pl-10 ${validationErrors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder={isRegistering ? "Digite seu email" : "Digite seu email, telefone ou CPF"}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                )}
                {validationErrors.identifier && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.identifier}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`form-input w-full pl-10 ${validationErrors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Digite sua senha"
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
                )}
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="form-label">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`form-input pl-10 ${validationErrors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      placeholder="Digite seu nome"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      className={`form-input pl-10 ${validationErrors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      placeholder="Digite seu telefone"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-white mb-4">Endereço</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">
                        CEP
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.address.zipCode}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, zipCode: e.target.value }
                          }))}
                          className="form-input pl-10"
                          placeholder="Digite seu CEP"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-white mb-1">
                          Rua
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors duration-300"
                          placeholder="Digite sua rua"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={formData.address.number}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, number: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors duration-300"
                          placeholder="Nº"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={formData.address.complement}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, complement: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors duration-300"
                          placeholder="Apto, Sala, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={formData.address.neighborhood}
                          onChange={e => setFormData(prev => ({
                            ...prev,
                            address: { ...prev.address, neighborhood: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors duration-300"
                          placeholder="Digite seu bairro"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-menu-accent text-white font-semibold rounded-lg hover:bg-menu-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {isRegistering ? 'Criar Conta' : 'Entrar'}
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-menu-accent hover:text-menu-accent/80"
            >
              {isRegistering
                ? 'Já tem uma conta? Entre'
                : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>

          <button
            onClick={() => onLogin(null)}
            className="w-full py-2.5 bg-white/5 text-gray-300 font-medium rounded-lg hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 mt-6"
          >
            Continuar como Convidado
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}