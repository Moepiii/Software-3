import type { FormEvent } from 'react';
import { useState } from 'react';
import { login, registerEmpresa, registerPersona, type LoginUser } from '../../api';
import { ChoiceView } from './VistaEleccion';
import { FormPersonaView } from './FormularioPersona';
import { FormEmpresaView } from './FormularioEmpresa';
import { LoginView } from './VistaInicioSesion';
import { mainContainerStyle, wrapperStyle } from './estilosAutenticacion';

type FormStep = 'LANDING' | 'CHOICE' | 'FORM_PERSONA' | 'FORM_EMPRESA' | 'LOGIN';

interface AuthFlowProps {
  onLoginSuccess: (token: string, user: LoginUser) => void;
  initialView?: 'login' | 'register';
}

export default function FlujoAutenticacion({ onLoginSuccess, initialView }: AuthFlowProps) {
  // Determinar el paso inicial basado en initialView
  const getInitialStep = (): FormStep => {
    if (initialView === 'login') return 'LOGIN';
    if (initialView === 'register') return 'CHOICE';
    return 'LANDING';
  };

  const [step, setStep] = useState<FormStep>(getInitialStep());
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

  const handleBack = () => {
    setErrorMsg('');
    if (step === 'CHOICE' || step === 'LOGIN') {
      // Volver a la página de inicio
      window.location.href = '/';
      return;
    }
    if (step === 'FORM_PERSONA' || step === 'FORM_EMPRESA') setStep('CHOICE');
  };

  const handleRegisterPersona = async (e: FormEvent) => {
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

  const handleRegisterEmpresa = async (e: FormEvent) => {
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const data = await login({ email, password });
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  };

  // ============================================
  // LANDING - Redirige a la página de inicio
  // ============================================
  if (step === 'LANDING') {
    window.location.href = '/';
    return null;
  }

  // ============================================
  // FORMULARIOS DE AUTENTICACIÓN
  // ============================================
  return (
    <main style={mainContainerStyle}>
      
      <div style={wrapperStyle}>
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