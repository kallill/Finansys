import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { getProfile, updateProfile, changePassword } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const load = async () => {
    try {
      const data = await getProfile();
      setProfile({ name: data.name, email: data.email });
    } catch (e) {
      setError('Falha ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await updateProfile(profile);
      setProfile({ name: data.name, email: data.email });
      setMessage('Perfil atualizado');
    } catch {
      setError('Erro ao atualizar perfil');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Senha alterada');
    } catch {
      setError('Erro ao alterar senha');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-bold">Perfil</h1>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
        </div>
        {message && <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm mb-6 border border-emerald-500/20">{message}</div>}
        {error && <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-6 border border-rose-500/20">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><User /> Dados do Perfil</h2>
            {loading ? <p>Carregando...</p> : (
              <form className="space-y-4" onSubmit={saveProfile}>
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Nome" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required />
                <Button variant="primary" type="submit">Salvar</Button>
              </form>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck /> Trocar Senha</h2>
            <form className="space-y-4" onSubmit={savePassword}>
              <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Senha atual" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3" placeholder="Nova senha" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <Button variant="primary" type="submit">Alterar</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
