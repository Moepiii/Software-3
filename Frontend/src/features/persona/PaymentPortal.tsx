import { useState, useEffect } from 'react';
import { realizarPago, getDeudaActual, type DeudaResponse } from '../../api/persona';

interface PaymentPortalProps {
    totalAPagar: number;
    montoDeuda: number;
    estadoNombre: string;
    isDarkMode?: boolean;
    onClose: () => void;
    onPaymentSuccess: (nuevaDeuda: DeudaResponse) => void;
}

type PayStep = 'method' | 'details' | 'confirm' | 'processing' | 'success' | 'error';
type PayMethod = 'card' | 'transfer' | 'wallet';

function MethodPill({
    id,
    label,
    icon,
    active,
    onClick,
    cardBg,
    border,
    green,
    isDarkMode,
    textSecondary,
}: {
    id: PayMethod;
    label: string;
    icon: string;
    active: boolean;
    onClick: () => void;
    cardBg: string;
    border: string;
    green: string;
    isDarkMode: boolean;
    textSecondary: string;
}) {
    return (
        <button
            id={`pay-method-${id}`}
            onClick={onClick}
            style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '12px',
                border: active ? `2px solid ${green}` : `2px solid ${border}`,
                backgroundColor: active ? (isDarkMode ? '#064e3b' : '#ecfdf5') : cardBg,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                color: active ? green : textSecondary,
                fontWeight: active ? '700' : '500',
                fontSize: '0.8rem',
            }}
        >
            <span style={{ fontSize: '1.6rem' }}>{icon}</span>
            {label}
        </button>
    );
}

const CARD_ICONS: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    default: '💳',
};

function detectCardBrand(num: string): string {
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'default';
}

function formatCardNumber(val: string): string {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string): string {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}

export default function PaymentPortal({
    totalAPagar,
    montoDeuda,
    estadoNombre,
    isDarkMode = false,
    onClose,
    onPaymentSuccess,
}: PaymentPortalProps) {
    const [step, setStep] = useState<PayStep>('method');
    const [method, setMethod] = useState<PayMethod>('card');
    const [montoPago, setMontoPago] = useState(totalAPagar.toFixed(2));
    const [montoError, setMontoError] = useState('');

    // Card fields
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

    // Transfer fields
    const [banco, setBanco] = useState('');
    const [referencia, setReferencia] = useState('');

    // Wallet fields
    const [walletPhone, setWalletPhone] = useState('');

    const [errorMsg, setErrorMsg] = useState('');
    const [progress, setProgress] = useState(0);

    const bg = isDarkMode ? '#0f172a' : '#f8fafc';
    const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const textPrimary = isDarkMode ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';
    const inputBg = isDarkMode ? '#0f172a' : '#f8fafc';
    const inputBorder = isDarkMode ? '#334155' : '#cbd5e1';
    const green = '#10b981';
    const blue = '#3b82f6';

    // Progress animation while processing
    useEffect(() => {
        if (step !== 'processing') return;
        const reset = setTimeout(() => setProgress(0), 0);
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 90) { clearInterval(interval); return 90; }
                return p + Math.random() * 15;
            });
        }, 300);
        return () => { clearTimeout(reset); clearInterval(interval); };
    }, [step]);

    const validateMonto = () => {
        const val = parseFloat(montoPago);
        if (isNaN(val) || val <= 0) {
            setMontoError('Ingrese un monto válido mayor a 0.');
            return false;
        }
        if (val > totalAPagar) {
            setMontoError(`El monto no puede superar ${totalAPagar.toFixed(2)} Bs.`);
            return false;
        }
        setMontoError('');
        return true;
    };

    const validateCard = () => {
        const errs: Record<string, string> = {};
        if (cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Número de tarjeta inválido';
        if (!cardHolder.trim()) errs.cardHolder = 'Ingrese el nombre del titular';
        if (expiry.length < 5) errs.expiry = 'Fecha de vencimiento inválida';
        if (cvv.length < 3) errs.cvv = 'CVV inválido';
        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleMethodNext = () => {
        if (!validateMonto()) return;
        setStep('details');
    };

    const handleDetailsNext = () => {
        if (method === 'card' && !validateCard()) return;
        if (method === 'transfer' && (!banco.trim() || !referencia.trim())) return;
        if (method === 'wallet' && walletPhone.replace(/\D/g, '').length < 10) return;
        setStep('confirm');
    };

    const handlePay = async () => {
        setStep('processing');
        try {
            await realizarPago({ monto: parseFloat(montoPago) });
            setProgress(100);
            setTimeout(async () => {
                const nuevaDeuda = await getDeudaActual();
                onPaymentSuccess(nuevaDeuda);
                setStep('success');
            }, 600);
        } catch (e: unknown) {
            setProgress(100);
            setErrorMsg(e instanceof Error ? e.message : 'Error al procesar el pago');
            setTimeout(() => setStep('error'), 400);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1.5px solid ${inputBorder}`,
        backgroundColor: inputBg,
        color: textPrimary,
        fontSize: '0.9rem',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: textSecondary,
        marginBottom: '6px',
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    const errorStyle: React.CSSProperties = {
        fontSize: '0.72rem',
        color: '#ef4444',
        marginTop: '4px',
    };

    // ─── Overlay y contenedor ─────────────────────────────────────────────────
    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes progressBar { from { width: 0%; } }
            `}</style>

            <div style={{
                background: cardBg,
                borderRadius: '24px',
                padding: '0',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                animation: 'slideUp 0.3s ease',
                border: `1px solid ${border}`,
            }}>

                {/* Header */}
                <div style={{
                    background: `linear-gradient(135deg, #059669 0%, #0284c7 100%)`,
                    padding: '28px 28px 24px',
                    borderRadius: '24px 24px 0 0',
                    position: 'relative',
                }}>
                    <button
                        id="btn-cerrar-portal-pago"
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.2)', border: 'none',
                            borderRadius: '50%', width: '32px', height: '32px',
                            cursor: 'pointer', color: 'white', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>

                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        PORTAL DE PAGO SEGURO
                    </div>
                    <div style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                        {parseFloat(montoPago || '0').toFixed(2)} Bs
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>
                        Deuda: {montoDeuda.toFixed(2)} Bs · Estado: {estadoNombre}
                    </div>

                    {/* Step indicators */}
                    {!['processing', 'success', 'error'].includes(step) && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '20px' }}>
                            {(['method', 'details', 'confirm'] as const).map((s, i) => (
                                <div key={s} style={{
                                    height: '4px', flex: 1, borderRadius: '2px',
                                    backgroundColor: ['method', 'details', 'confirm'].indexOf(step) >= i
                                        ? 'white' : 'rgba(255,255,255,0.3)',
                                    transition: 'background-color 0.3s',
                                }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div style={{ padding: '28px' }}>

                    {/* ── STEP: METHOD ─────────────────────────────────────── */}
                    {step === 'method' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Monto a pagar (Bs)</label>
                                <input
                                    id="portal-input-monto"
                                    type="number"
                                    min="0.01"
                                    max={totalAPagar}
                                    step="0.01"
                                    value={montoPago}
                                    onChange={(e) => { setMontoPago(e.target.value); setMontoError(''); }}
                                    style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: '700', color: green }}
                                />
                                {montoError && <div style={errorStyle}>{montoError}</div>}
                                <div style={{ marginTop: '6px', fontSize: '0.72rem', color: textSecondary }}>
                                    Máximo: {totalAPagar.toFixed(2)} Bs (incluye tasa aplicada)
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Método de pago</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <MethodPill id="card" label="Tarjeta" icon="💳" active={method === 'card'} onClick={() => setMethod('card')} cardBg={cardBg} border={border} green={green} isDarkMode={!!isDarkMode} textSecondary={textSecondary} />
                                    <MethodPill id="transfer" label="Transferencia" icon="🏦" active={method === 'transfer'} onClick={() => setMethod('transfer')} cardBg={cardBg} border={border} green={green} isDarkMode={!!isDarkMode} textSecondary={textSecondary} />
                                    <MethodPill id="wallet" label="Pago Móvil" icon="📱" active={method === 'wallet'} onClick={() => setMethod('wallet')} cardBg={cardBg} border={border} green={green} isDarkMode={!!isDarkMode} textSecondary={textSecondary} />
                                </div>
                            </div>

                            <button
                                id="portal-btn-continuar"
                                onClick={handleMethodNext}
                                style={{
                                    width: '100%', padding: '14px',
                                    background: 'linear-gradient(135deg, #059669, #0284c7)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                                    letterSpacing: '0.03em', transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                                Continuar →
                            </button>
                        </div>
                    )}

                    {/* ── STEP: DETAILS ────────────────────────────────────── */}
                    {step === 'details' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {method === 'card' && (
                                <>
                                    {/* Card preview */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                                        borderRadius: '16px', padding: '20px 24px',
                                        color: 'white', marginBottom: '4px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>TARJETA DE CRÉDITO/DÉBITO</span>
                                            <span style={{ fontSize: '1.2rem' }}>{CARD_ICONS[detectCardBrand(cardNumber.replace(/\s/g, ''))]}</span>
                                        </div>
                                        <div style={{ fontSize: '1.15rem', letterSpacing: '0.2em', marginBottom: '16px', fontFamily: 'monospace' }}>
                                            {cardNumber || '•••• •••• •••• ••••'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ opacity: 0.7 }}>TITULAR<br /><span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>{cardHolder || 'NOMBRE APELLIDO'}</span></span>
                                            <span style={{ opacity: 0.7, textAlign: 'right' }}>VENCE<br /><span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>{expiry || 'MM/AA'}</span></span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Número de tarjeta</label>
                                        <input id="portal-card-number" style={inputStyle} placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} />
                                        {cardErrors.cardNumber && <div style={errorStyle}>{cardErrors.cardNumber}</div>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nombre del titular</label>
                                        <input id="portal-card-holder" style={inputStyle} placeholder="Como aparece en la tarjeta"
                                            value={cardHolder}
                                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())} />
                                        {cardErrors.cardHolder && <div style={errorStyle}>{cardErrors.cardHolder}</div>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Vencimiento</label>
                                            <input id="portal-card-expiry" style={inputStyle} placeholder="MM/AA"
                                                value={expiry}
                                                onChange={(e) => setExpiry(formatExpiry(e.target.value))} />
                                            {cardErrors.expiry && <div style={errorStyle}>{cardErrors.expiry}</div>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>CVV</label>
                                            <input id="portal-card-cvv" style={inputStyle} placeholder="•••" type="password" maxLength={4}
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                                            {cardErrors.cvv && <div style={errorStyle}>{cardErrors.cvv}</div>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {method === 'transfer' && (
                                <>
                                    <div style={{ padding: '16px', background: isDarkMode ? '#1e3a5f22' : '#eff6ff', borderRadius: '12px', border: `1px solid ${blue}44` }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: blue, marginBottom: '8px' }}>DATOS BANCARIOS RECEPTORES</div>
                                        <div style={{ fontSize: '0.82rem', color: textPrimary, lineHeight: '1.8' }}>
                                            <b>Banco:</b> Banco Nacional Ecológico<br />
                                            <b>RIF:</b> J-30456789-0<br />
                                            <b>Cuenta:</b> 0191-0000-12-0000123456<br />
                                            <b>Concepto:</b> Pago deuda ambiental
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Banco emisor</label>
                                        <select id="portal-transfer-banco" value={banco} onChange={(e) => setBanco(e.target.value)}
                                            style={{ ...inputStyle }}>
                                            <option value="">Seleccione su banco...</option>
                                            <option>Banco de Venezuela</option>
                                            <option>Banesco</option>
                                            <option>Mercantil</option>
                                            <option>BBVA Provincial</option>
                                            <option>Bicentenario</option>
                                            <option>BOD</option>
                                            <option>Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Número de referencia</label>
                                        <input id="portal-transfer-ref" style={inputStyle} placeholder="Ej: 000123456789"
                                            value={referencia}
                                            onChange={(e) => setReferencia(e.target.value.replace(/\D/g, ''))} />
                                    </div>
                                </>
                            )}

                            {method === 'wallet' && (
                                <>
                                    <div style={{ padding: '16px', background: isDarkMode ? '#064e3b22' : '#f0fdf4', borderRadius: '12px', border: `1px solid ${green}44` }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: green, marginBottom: '8px' }}>PAGO MÓVIL RECEPTOR</div>
                                        <div style={{ fontSize: '0.82rem', color: textPrimary, lineHeight: '1.8' }}>
                                            <b>Teléfono:</b> 0412-0000000<br />
                                            <b>RIF:</b> J-30456789-0<br />
                                            <b>Banco:</b> Banco de Venezuela<br />
                                            <b>Concepto:</b> Pago deuda ambiental
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Tu número de teléfono</label>
                                        <input id="portal-wallet-phone" style={inputStyle} placeholder="04XX-XXXXXXX" type="tel"
                                            value={walletPhone}
                                            onChange={(e) => setWalletPhone(e.target.value)} />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <button
                                    id="portal-btn-atras-details"
                                    onClick={() => setStep('method')}
                                    style={{
                                        flex: 1, padding: '12px', border: `1.5px solid ${border}`,
                                        borderRadius: '10px', background: 'transparent',
                                        color: textSecondary, cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                                    }}
                                >← Atrás</button>
                                <button
                                    id="portal-btn-revisar"
                                    onClick={handleDetailsNext}
                                    style={{
                                        flex: 2, padding: '12px',
                                        background: 'linear-gradient(135deg, #059669, #0284c7)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
                                    }}
                                >Revisar pago →</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP: CONFIRM ────────────────────────────────────── */}
                    {step === 'confirm' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: textPrimary }}>Resumen de pago</div>

                            <div style={{ background: bg, borderRadius: '14px', padding: '18px', border: `1px solid ${border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Monto a pagar</span>
                                    <span style={{ color: textPrimary, fontWeight: '700', fontSize: '1rem' }}>{parseFloat(montoPago).toFixed(2)} Bs</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Método</span>
                                    <span style={{ color: textPrimary, fontWeight: '600', fontSize: '0.85rem' }}>
                                        {method === 'card' ? '💳 Tarjeta' : method === 'transfer' ? '🏦 Transferencia' : '📱 Pago Móvil'}
                                    </span>
                                </div>
                                {method === 'card' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Tarjeta</span>
                                        <span style={{ color: textPrimary, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                            •••• {cardNumber.replace(/\s/g, '').slice(-4)}
                                        </span>
                                    </div>
                                )}
                                {method === 'transfer' && referencia && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Referencia</span>
                                        <span style={{ color: textPrimary, fontSize: '0.85rem' }}>{referencia}</span>
                                    </div>
                                )}
                                {method === 'wallet' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Teléfono</span>
                                        <span style={{ color: textPrimary, fontSize: '0.85rem' }}>{walletPhone}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 14px', borderRadius: '10px',
                                background: isDarkMode ? '#064e3b33' : '#f0fdf4',
                                border: `1px solid ${green}44`,
                            }}>
                                <span style={{ fontSize: '1rem' }}>🔒</span>
                                <span style={{ fontSize: '0.75rem', color: green, fontWeight: '600' }}>
                                    Transacción cifrada con SSL/TLS 256-bit
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    id="portal-btn-atras-confirm"
                                    onClick={() => setStep('details')}
                                    style={{
                                        flex: 1, padding: '12px', border: `1.5px solid ${border}`,
                                        borderRadius: '10px', background: 'transparent',
                                        color: textSecondary, cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                                    }}
                                >← Atrás</button>
                                <button
                                    id="portal-btn-confirmar-pago"
                                    onClick={handlePay}
                                    style={{
                                        flex: 2, padding: '12px',
                                        background: 'linear-gradient(135deg, #059669, #0284c7)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                                        boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
                                    }}
                                >✓ Confirmar pago</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP: PROCESSING ─────────────────────────────────── */}
                    {step === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{
                                width: '64px', height: '64px',
                                border: '5px solid transparent',
                                borderTopColor: green,
                                borderRightColor: blue,
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 24px',
                            }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: textPrimary, marginBottom: '8px' }}>
                                Procesando tu pago...
                            </div>
                            <div style={{ fontSize: '0.82rem', color: textSecondary, marginBottom: '24px' }}>
                                No cierres esta ventana
                            </div>
                            <div style={{ background: isDarkMode ? '#1e293b' : '#f1f5f9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #059669, #0284c7)',
                                    borderRadius: '8px',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* ── STEP: SUCCESS ─────────────────────────────────────── */}
                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #059669, #34d399)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                                animation: 'checkPop 0.4s ease',
                                fontSize: '2rem',
                                boxShadow: '0 8px 30px rgba(5,150,105,0.4)',
                            }}>✓</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: textPrimary, marginBottom: '8px' }}>
                                ¡Pago exitoso!
                            </div>
                            <div style={{ fontSize: '0.88rem', color: textSecondary, marginBottom: '8px' }}>
                                Se procesó <b style={{ color: green }}>{parseFloat(montoPago).toFixed(2)} Bs</b>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: textSecondary, marginBottom: '28px' }}>
                                Recibirás un comprobante por correo electrónico.
                            </div>
                            <button
                                id="portal-btn-cerrar-exito"
                                onClick={onClose}
                                style={{
                                    padding: '12px 36px',
                                    background: 'linear-gradient(135deg, #059669, #0284c7)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
                                }}
                            >Cerrar portal</button>
                        </div>
                    )}

                    {/* ── STEP: ERROR ───────────────────────────────────────── */}
                    {step === 'error' && (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #dc2626, #f87171)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px', fontSize: '2rem',
                                boxShadow: '0 8px 30px rgba(220,38,38,0.4)',
                            }}>✕</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: textPrimary, marginBottom: '8px' }}>
                                Error en el pago
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '28px', padding: '0 12px' }}>
                                {errorMsg}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    id="portal-btn-cancelar-error"
                                    onClick={onClose}
                                    style={{
                                        padding: '11px 24px', border: `1.5px solid ${border}`,
                                        borderRadius: '10px', background: 'transparent',
                                        color: textSecondary, cursor: 'pointer', fontWeight: '600',
                                    }}
                                >Cancelar</button>
                                <button
                                    id="portal-btn-reintentar"
                                    onClick={() => setStep('confirm')}
                                    style={{
                                        padding: '11px 24px',
                                        background: '#dc2626',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontWeight: '700', cursor: 'pointer',
                                    }}
                                >Reintentar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
