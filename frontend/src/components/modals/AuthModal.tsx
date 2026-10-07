import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    login,
    sendRegisterOtp,
    registerWithOtp,
    sendForgotOtp,
    resetPassword,
    isLoading,
    errorMessage,
    successMessage,
  } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const backdropRef = useRef<HTMLDivElement>(null);
  const isMouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;

  const handleSendOtp = async () => {
    if (!isEmailValid) return;
    if (authMode === 'register') {
      if (!isPasswordValid) return;
      const ok = await sendRegisterOtp(email, password);
      if (ok) setCountdown(60);
    } else if (authMode === 'forgot_password') {
      const ok = await sendForgotOtp(email);
      if (ok) setCountdown(60);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login(email, password);
    } else if (authMode === 'register') {
      await registerWithOtp(name, email, password, otp);
    } else if (authMode === 'forgot_password') {
      await resetPassword(email, otp, password);
    }
  };

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      isMouseDownOnBackdrop.current = true;
    } else {
      isMouseDownOnBackdrop.current = false;
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent) => {
    if (isMouseDownOnBackdrop.current && e.target === backdropRef.current) {
      closeAuthModal();
    }
    isMouseDownOnBackdrop.current = false;
  };

  return (
    <div
      ref={backdropRef}
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              {authMode === 'login' && 'Lehrer-Anmeldung'}
              {authMode === 'register' && 'Neues Konto erstellen'}
              {authMode === 'forgot_password' && 'Passwort zurücksetzen'}
            </h3>
            <p className="text-xs text-slate-500">
              {authMode === 'login' && 'Đăng nhập tài khoản giáo viên'}
              {authMode === 'register' && 'Tạo tài khoản giáo viên mới với mã OTP'}
              {authMode === 'forgot_password' && 'Đặt lại mật khẩu bảo vệ tài khoản'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {authMode !== 'forgot_password' && (
          <div className="flex border-b border-slate-100 p-1.5 bg-slate-100 mx-6 mt-4 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Anmelden (Đăng nhập)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Registrieren (Đăng ký)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Name (Họ và tên giáo viên)
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <User size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="z.B. Nguyễn Đức Hồng Ân"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              E-Mail
            </label>
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="lehrer@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
              />
            </div>
            {email && !isEmailValid && (
              <span className="text-[11px] text-red-500 mt-1 block">Email phải đúng định dạng (vd: abc@domain.com)</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {authMode === 'forgot_password' ? 'Neues Passwort (Mật khẩu mới)' : 'Passwort (Mật khẩu)'}
            </label>
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
              />
            </div>
            {password && !isPasswordValid && (
              <span className="text-[11px] text-red-500 mt-1 block">Mật khẩu phải chứa ít nhất 8 ký tự</span>
            )}
          </div>

          {(authMode === 'register' || authMode === 'forgot_password') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mã xác thực OTP (6 chữ số)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <KeyRound size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none text-slate-800 font-mono tracking-widest font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || countdown > 0 || !isEmailValid || (authMode === 'register' && !isPasswordValid)}
                  className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all disabled:opacity-40 shrink-0"
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã OTP'}
                </button>
              </div>
            </div>
          )}

          {authMode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAuthMode('forgot_password')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Passwort vergessen? (Quên mật khẩu)
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              !isEmailValid ||
              !isPasswordValid ||
              ((authMode === 'register' || authMode === 'forgot_password') && otp.length < 6)
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 mt-3"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            <span>
              {authMode === 'login' && 'Jetzt anmelden'}
              {authMode === 'register' && 'Konto erstellen'}
              {authMode === 'forgot_password' && 'Passwort zurücksetzen'}
            </span>
          </button>

          {authMode === 'forgot_password' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                ← Zurück zur Anmeldung (Quay lại đăng nhập)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};