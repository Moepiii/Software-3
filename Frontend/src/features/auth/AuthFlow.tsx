import React, { useState, useEffect } from 'react';
import { login, registerEmpresa, registerPersona, type LoginUser } from '../../api';
import { LandingView } from './LandingView';
import { ChoiceView } from './ChoiceView';
import { FormPersonaView } from './FormPersonaView';
import { FormEmpresaView } from './FormEmpresaView';
import { LoginView } from './LoginView';
import { mainContainerStyle, bgBaseStyle, wrapperStyle } from './authStyles';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';

interface AuthFlowProps {
  onLoginSuccess: (token: string, user: LoginUser) => void;
}

export default function AuthFlow({ onLoginSuccess }: AuthFlowProps) {
  const [step, setStep] = useState<FormStep>('LANDING');
  const [errorMsg, setErrorMsg] = useState('');

  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rif, setRif] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const backgrounds = ['/bg1.png', '/bg2.png', '/bg3.png', '/bg4.png'];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleBack = () => {
    setErrorMsg('');
    if (step === 'CHOICE' || step === 'LOGIN') setStep('LANDING');
    if (step === 'FORM_PERSONA' || step === 'FORM_EMPRESA') setStep('CHOICE');
  };

  const handleRegisterPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    try {
      await registerPersona({ cedula, email, password, nombres, apellidos });
      setStep('LOGIN');
      setCedula(''); setNombres(''); setApellidos(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  };

  const handleRegisterEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    try {
      await registerEmpresa({ rif, email, password, nombre_empresa: nombreEmpresa });
      setStep('LOGIN');
      setRif(''); setNombreEmpresa(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const data = await login({ email, password });
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  };

  return (
    <main style={mainContainerStyle}>
      {backgrounds.map((bgUrl, index) => (
        <div
          key={bgUrl}
          style={{ ...bgBaseStyle, backgroundImage: `url('${bgUrl}')`, opacity: index === currentBgIndex ? 1 : 0 }}
        />
      ))}
      <div style={wrapperStyle}>
        {step === 'LANDING' && (
          <LandingView
            onRegister={() => setStep('CHOICE')}
            onLogin={() => setStep('LOGIN')}
          />
        )}
        {step === 'CHOICE' && (
          <ChoiceView
            onPersona={() => setStep('FORM_PERSONA')}
            onEmpresa={() => setStep('FORM_EMPRESA')}
            onBack={handleBack}
          />
        )}
        {step === 'FORM_PERSONA' && (
          <FormPersonaView
            cedula={cedula} setCedula={setCedula}
            nombres={nombres} setNombres={setNombres}
            apellidos={apellidos} setApellidos={setApellidos}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)}
            showConfirmPassword={showConfirmPassword} onToggleConfirmPassword={() => setShowConfirmPassword(s => !s)}
            errorMsg={errorMsg}
            onSubmit={handleRegisterPersona}
            onBack={handleBack}
          />
        )}
        {step === 'FORM_EMPRESA' && (
          <FormEmpresaView
            rif={rif} setRif={setRif}
            nombreEmpresa={nombreEmpresa} setNombreEmpresa={setNombreEmpresa}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)}
            showConfirmPassword={showConfirmPassword} onToggleConfirmPassword={() => setShowConfirmPassword(s => !s)}
            errorMsg={errorMsg}
            onSubmit={handleRegisterEmpresa}
            onBack={handleBack}
          />
        )}
        {step === 'LOGIN' && (
          <LoginView
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            showPassword={showPassword} onTogglePassword={() => setShowPassword(s => !s)}
            errorMsg={errorMsg}
            onSubmit={handleLogin}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}
