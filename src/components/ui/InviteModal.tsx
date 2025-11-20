// src/components/ui/InviteModal.tsx
'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2, Mail, UserCog, Send, CheckCircle2, AlertCircle, Link2, UserPlus } from 'lucide-react';
import { authApi } from '@/lib/api';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess?: () => void;
}

export function InviteModal({ isOpen, onClose, onInviteSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Agent' | 'Supervisor'>('Agent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!email.toLowerCase().endsWith('@musclepoints.com')) {
        setError('El email debe ser del dominio @musclepoints.com');
        setIsSubmitting(false);
        return;
      }

      const result = await authApi.invite(email.toLowerCase(), role);
      setInviteUrl(result.invite_url);
      setEmailSent(result.email_sent || false);
      onInviteSuccess?.();
    } catch (e: unknown) {
      let errorMessage = 'Error al enviar invitación';
      if (e && typeof e === 'object') {
        const errorObj = e as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = errorObj?.response?.data?.detail || errorObj?.message || 'Error al enviar invitación';
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('Agent');
    setInviteUrl(null);
    setEmailSent(false);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header con gradiente sutil */}
        <div className="relative bg-gradient-to-r from-[#00A9E0]/5 via-[#00A9E0]/10 to-[#00A9E0]/5 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00A9E0]/10 rounded-xl">
                <UserPlus className="w-5 h-5 text-[#00A9E0]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invitar Usuario</h2>
                <p className="text-xs text-gray-500 mt-0.5">Agrega un nuevo miembro al equipo</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!inviteUrl ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@musclepoints.com"
                    required
                    className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A9E0]/20 focus:border-[#00A9E0] transition-all duration-200 bg-gray-50/50 hover:bg-gray-50"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Debe ser del dominio @musclepoints.com
                </p>
              </div>

              {/* Campo Rol */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-semibold text-gray-700">
                  Rol del Usuario
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Agent' | 'Supervisor')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A9E0]/20 focus:border-[#00A9E0] transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 appearance-none cursor-pointer"
                  >
                    <option value="Agent">Agent</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>



              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                  style={{
                    backgroundColor: '#00A9E0',
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#D9F2FA';
                      e.currentTarget.style.color = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#00A9E0';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Invitación
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Mensaje de éxito */}
              <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-1">¡Invitación Enviada!</h3>
                    <p className="text-sm text-green-700 mb-2">
                      Se ha enviado la invitación a <strong className="font-semibold">{email}</strong>
                    </p>
                    {!emailSent && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>El email no pudo ser enviado automáticamente. Usa el enlace de abajo para compartir la invitación manualmente.</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enlace de invitación */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Link2 className="w-4 h-4 text-[#00A9E0]" />
                  Enlace de Invitación
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inviteUrl}
                      readOnly
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9E0]/20 focus:border-[#00A9E0]"
                    />
                    <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium ${
                      copied
                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                    }`}
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 text-white rounded-xl transition-colors font-semibold"
                style={{
                  backgroundColor: '#00A9E0',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D9F2FA';
                  e.currentTarget.style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00A9E0';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
