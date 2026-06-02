import type { FormEvent } from 'react';
import { PasswordInput } from '../../shared/PasswordInput';
import { cardStyle, h2Style, formGridStyle, inputStyle, buttonStyle, backButtonStyle } from './authStyles';

interface FormEmpresaViewProps {
  rif: string; setRif: (v: string) => void;
  nombreEmpresa: string; setNombreEmpresa: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; onTogglePassword: () => void;
  showConfirmPassword: boolean; onToggleConfirmPassword: () => void;
  errorMsg: string;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}

export function FormEmpresaView({
  rif, setRif,
  nombreEmpresa, setNombreEmpresa,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, onTogglePassword,
  showConfirmPassword, onToggleConfirmPassword,
  errorMsg,
  onSubmit,
  onBack,
}: FormEmpresaViewProps) {
  return (
    <div style={cardStyle}>
      <h2 style={h2Style}>Registro de Empresa</h2>
      <form style={formGridStyle} onSubmit={onSubmit}>
        <input type="text" placeholder="RIF" required value={rif} onChange={e => setRif(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Nombre de la empresa" required value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Correo Electrónico" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          show={showPassword}
          onToggle={onTogglePassword}
        />
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirmar Contraseña"
          show={showConfirmPassword}
          onToggle={onToggleConfirmPassword}
        />
        {errorMsg && <p style={{ color: '#f87171', margin: '0' }}>{errorMsg}</p>}
        <button type="submit" style={buttonStyle('var(--primary-500)', '#052e1c', 'none', '100%')}>
          Registrar Empresa
        </button>
      </form>
      <button onClick={onBack} style={backButtonStyle}>← Volver</button>
    </div>
  );
}
