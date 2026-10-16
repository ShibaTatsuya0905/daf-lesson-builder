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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 backdrop-blur-xs p-4"
    >
      <div
        className="bg-paper-white border border-mist-border rounded-[24px] w-full max-w-md shadow-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 px-6 border-b border-mist-border flex items-center justify-between bg-chalk-canvas">
          <div>
            <h3 className="text-base font-bold text-ink-charcoal">
              {authMode === 'login' && 'Lehrer-Anmeldung'}
              {authMode === 'register' && 'Neues Konto erstellen'}
              {authMode === 'forgot_password' && 'Passwort zurücksetzen'}
            </h3>
            <p className="text-xs text-slate-veil">
              {authMode === 'login' && 'Đăng nhập tài khoản giáo viên'}
              {authMode === 'register' && 'Tạo tài khoản giáo viên mới với mã OTP'}
              {authMode === 'forgot_password' && 'Đặt lại mật khẩu bảo vệ tài khoản'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-full text-slate-veil hover:text-ink-charcoal hover:bg-mist-border transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {authMode !== 'forgot_password' && (
          <div className="flex border-b border-mist-border p-1 bg-chalk-canvas mx-6 mt-4 rounded-full">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-paper-white text-ink-charcoal shadow-xs'
                  : 'text-slate-veil hover:text-ink-charcoal'
              }`}
            >
              Anmelden (Đăng nhập)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-paper-white text-ink-charcoal shadow-xs'
                  : 'text-slate-veil hover:text-ink-charcoal'
              }`}
            >
              Registrieren (Đăng ký)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">
                Name (Họ và tên giáo viên)
              </label>
              <div className="flex items-center gap-2.5 bg-chalk-canvas px-3 py-2 rounded border border-mist-border focus-within:border-iris-bolt transition-colors">
                <User size={15} className="text-slate-veil shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="z.B. Nguyễn Đức Hồng Ân"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal font-semibold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-veil mb-1">
              E-Mail
            </label>
            <div className="flex items-center gap-2.5 bg-chalk-canvas px-3 py-2 rounded border border-mist-border focus-within:border-iris-bolt transition-colors">
              <Mail size={15} className="text-slate-veil shrink-0" />
              <input
                type="email"
                required
                placeholder="lehrer@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal font-semibold"
              />
            </div>
            {email && !isEmailValid && (
              <span className="text-[11px] text-[#dc2626] mt-1 block">Email phải đúng định dạng (vd: abc@domain.com)</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-veil mb-1">
              {authMode === 'forgot_password' ? 'Neues Passwort (Mật khẩu mới)' : 'Passwort (Mật khẩu)'}
            </label>
            <div className="flex items-center gap-2.5 bg-chalk-canvas px-3 py-2 rounded border border-mist-border focus-within:border-iris-bolt transition-colors">
              <Lock size={15} className="text-slate-veil shrink-0" />
              <input
                type="password"
                required
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal font-semibold"
              />
            </div>
            {password && !isPasswordValid && (
              <span className="text-[11px] text-[#dc2626] mt-1 block">Mật khẩu phải chứa ít nhất 8 ký tự</span>
            )}
          </div>

          {(authMode === 'register' || authMode === 'forgot_password') && (
            <div>
              <label className="block text-xs font-semibold text-slate-veil mb-1">
                Mã xác thực OTP (6 chữ số)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-chalk-canvas px-3 py-2 rounded border border-mist-border focus-within:border-iris-bolt transition-colors">
                  <KeyRound size={15} className="text-slate-veil shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none text-ink-charcoal font-mono tracking-widest font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || countdown > 0 || !isEmailValid || (authMode === 'register' && !isPasswordValid)}
                  className="px-4 py-2 rounded-full border border-mist-border bg-paper-white hover:bg-chalk-canvas text-ink-charcoal text-xs font-semibold transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
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
                className="text-xs text-iris-bolt hover:underline font-semibold cursor-pointer"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-iris-bolt hover:opacity-90 text-paper-white text-xs font-semibold shadow-xs transition-opacity disabled:opacity-50 mt-3 cursor-pointer"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
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
                className="text-xs text-slate-veil hover:text-ink-charcoal font-semibold cursor-pointer"
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