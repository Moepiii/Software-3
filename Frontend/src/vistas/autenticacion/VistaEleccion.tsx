import { cardStyle, h2Style, buttonStyle, backButtonStyle } from './estilosAutenticacion';

interface ChoiceViewProps {
  onPersona: () => void;
  onEmpresa: () => void;
  onBack: () => void;
}

export function ChoiceView({ onPersona, onEmpresa, onBack }: ChoiceViewProps) {
  return (
    <div style={cardStyle}>
      <h2 style={h2Style}>¿Cómo deseas registrarte?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
        <button onClick={onPersona} style={buttonStyle('var(--primary-500)', '#052e1c', 'none', '100%')}>
          Soy una Persona
        </button>
        <button onClick={onEmpresa} style={buttonStyle('var(--primary-500)', '#052e1c', 'none', '100%')}>
          Soy una Empresa
        </button>
      </div>
      <button onClick={onBack} style={backButtonStyle}>← Volver</button>
    </div>
  );
}
