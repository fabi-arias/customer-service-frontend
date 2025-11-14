// src/components/ui/InviteModal.tsx
'use client';

import { useState } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
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
    // Overlay (más suave y con blur)
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/20 backdrop-blur-[2px]">
      {/* Card (rounded-3xl + sombra limpia + ring sutil) */}
      <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header (sin línea dura, más aire, botón cerrar cómodo) */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Invitar usuario</h2>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (SIN cambios por ahora) */}
        <div className="p-6">
          {!inviteUrl ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@musclepoints.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9E0] focus:border-[#00A9E0]"
                />
                <p className="mt-1 text-xs text-gray-500">Debe ser del dominio @musclepoints.com</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Agent' | 'Supervisor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9E0] focus:border-[#00A9E0]"
                >
                  <option value="Agent">Agent</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isSubmitting ? '#00A9E0' : '#00A9E0',
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
                    'Enviar Invitación'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Invitación enviada</span>
                </div>
                <p className="text-sm text-green-600">
                  Se ha enviado la invitación a <strong>{email}</strong>
                </p>
                {!emailSent && (
                  <p className="text-xs text-yellow-600 mt-2">
                    ⚠️ El email no pudo ser enviado automáticamente. Usa el enlace de abajo para compartir la invitación.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace de invitación
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Copiado</span>
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

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-white rounded-lg transition-colors"
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
