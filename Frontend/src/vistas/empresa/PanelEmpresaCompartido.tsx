import PanelPersona from '../persona/PanelPersona';
import type { LoginUser } from '../../api/auth';

interface PanelEmpresaCompartidoProps {
    isDarkMode?: boolean;
    user: LoginUser;
    onUpdateUser: (user: LoginUser) => void;
}

export default function PanelEmpresaCompartido({ isDarkMode = false, user, onUpdateUser }: PanelEmpresaCompartidoProps) {
    return (
        <PanelPersona
            isDarkMode={isDarkMode}
            user={user}
            onUpdateUser={onUpdateUser}
            tipo="JURIDICO"
        />
    );
}
