// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Loader2, UserPlus, MoreVertical, Copy, RotateCcw, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { InviteModal } from '@/components/ui/InviteModal';

interface InvitedUser {
  email: string;
  role: string;
  status: string;
  invited_by: string;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<InvitedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InvitedUser | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Verificar que sea Supervisor usando el hook centralizado
  useEffect(() => {
    if (!isLoading && user) {
      const groups = user.groups ?? [];
      if (!groups.includes('Supervisor')) {
        router.push('/access-denied');
      }
    } else if (!isLoading && !user) {
      router.push('/access-denied');
    }
  }, [user, isLoading, router]);

  const loadUsers = async () => {
    const groups = user?.groups ?? [];
    if (groups.includes('Supervisor')) {
      try {
        setIsLoadingUsers(true);
        const result = await authApi.listUsers();
        setUsers(result.users);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    }
  };

  useEffect(() => {
    const groups = user?.groups ?? [];
    if (groups.includes('Supervisor')) {
      loadUsers();
    }
  }, [user]);

  const handleReinvite = async (userEmail: string, role: string) => {
    try {
      await authApi.invite(userEmail, role as 'Agent' | 'Supervisor');
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error reenviando invitación:', error);
    }
  };

  const handleUpdateStatus = async (userEmail: string, newStatus: 'pending' | 'active' | 'revoked') => {
    try {
      // Actualizar optimísticamente el estado en la UI
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.email === userEmail 
            ? { ...user, status: newStatus }
            : user
        )
      );
      setActionMenuOpen(null);
      
      // Llamar al backend
      await authApi.updateUserStatus(userEmail, newStatus);
      
      // Recargar usuarios para asegurar sincronización con el backend
      await loadUsers();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      // Si hay error, recargar para mostrar el estado real del servidor
      await loadUsers();
    }
  };

  const handleUpdateRole = async (userEmail: string, newRole: 'Agent' | 'Supervisor') => {
    try {
      await authApi.updateUserRole(userEmail, newRole);
      await loadUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error actualizando rol:', error);
    }
  };

  const handleCopyInviteLink = async (userEmail: string) => {
    try {
      // Obtener el invite_url reenviando la invitación
      const result = await authApi.invite(userEmail, users.find(u => u.email === userEmail)?.role as 'Agent' | 'Supervisor');
      await navigator.clipboard.writeText(result.invite_url);
      setCopiedEmail(userEmail);
      setTimeout(() => setCopiedEmail(null), 2000);
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error copiando enlace:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
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
              <UserPlus className="w-4 h-4" />
              Invitar usuario
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Administrar usuarios</h1>
          <p className="text-gray-600 mt-2">Gestiona las invitaciones y usuarios del sistema</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay usuarios registrados aún.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Usa el botón "Invitar usuario" arriba para comenzar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invitado por
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.email}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'Supervisor' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'revoked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.invited_by}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === user.email ? null : user.email)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {actionMenuOpen === user.email && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  {user.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(user.email, 'active')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Activar
                                      </button>
                                      <button
                                        onClick={() => handleReinvite(user.email, user.role)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                        Reenviar
                                      </button>
                                      <button
                                        onClick={() => handleCopyInviteLink(user.email)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <Copy className="w-4 h-4" />
                                        {copiedEmail === user.email ? 'Copiado!' : 'Copiar enlace'}
                                      </button>
                                    </>
                                  )}
                                  
                                  {user.status === 'active' && (
                                    <>
                                      <button
                                        onClick={() => handleReinvite(user.email, user.role)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                        Reinvitar
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRole(user.email, user.role === 'Agent' ? 'Supervisor' : 'Agent')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        Cambiar a {user.role === 'Agent' ? 'Supervisor' : 'Agent'}
                                      </button>
                                    </>
                                  )}
                                  
                                  {user.status === 'revoked' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(user.email, 'active')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        Reactivar
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRole(user.email, user.role === 'Agent' ? 'Supervisor' : 'Agent')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                        Cambiar a {user.role === 'Agent' ? 'Supervisor' : 'Agent'}
                                      </button>
                                    </>
                                  )}
                                  
                                  {(user.status === 'pending' || user.status === 'active') && (
                                    <button
                                      onClick={() => handleUpdateStatus(user.email, 'revoked')}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Ban className="w-4 h-4" />
                                      Revocar
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={loadUsers}
      />
      
      {/* Click fuera del menú para cerrarlo */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}

