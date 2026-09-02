import type React from 'react';
import instagramIcon from '../assets/instagram.png';
import facebookIcon from '../assets/facebook.png';
import whatsappIcon from '../assets/whatsapp.png';

const footerLinkStyle: React.CSSProperties = {
  color: '#d1d5db',
  textDecoration: 'none',
  fontSize: '0.85rem',
  transition: 'color 0.2s',
};

const socialIconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  objectFit: 'contain',
  transition: 'all 0.2s',
  cursor: 'pointer',
  filter: 'brightness(0) invert(1)',
};

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      style={footerLinkStyle}
      onMouseEnter={(event) => { event.currentTarget.style.color = '#ffffff'; }}
      onMouseLeave={(event) => { event.currentTarget.style.color = '#d1d5db'; }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#065a46',
      color: '#ffffff',
      padding: '2rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} title="Instagram">
            <img src={instagramIcon} alt="Instagram" style={socialIconStyle} onMouseEnter={(event) => { event.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(event) => { event.currentTarget.style.transform = 'scale(1)'; }} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} title="Facebook">
            <img src={facebookIcon} alt="Facebook" style={socialIconStyle} onMouseEnter={(event) => { event.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(event) => { event.currentTarget.style.transform = 'scale(1)'; }} />
          </a>
          <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} title="WhatsApp">
            <img src={whatsappIcon} alt="WhatsApp" style={socialIconStyle} onMouseEnter={(event) => { event.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(event) => { event.currentTarget.style.transform = 'scale(1)'; }} />
          </a>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <FooterLink>Política de Privacidad</FooterLink>
          <FooterLink>Términos de Servicio</FooterLink>
          <FooterLink>Reportes Anuales</FooterLink>
          <FooterLink>Contáctanos</FooterLink>
        </div>
      </div>
    </footer>
  );
}
