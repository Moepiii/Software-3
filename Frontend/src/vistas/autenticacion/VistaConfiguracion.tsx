import React, { useState } from 'react';
import type { LoginUser } from '../../api';

interface SettingsViewProps {
  user: LoginUser;
  onSave: (updatedUser: LoginUser) => void;
  onCancel: () => void;
  onLogout: () => void;
}

export function SettingsView({ user, onSave, onCancel, onLogout }: SettingsViewProps) {
  // Field states
  const [fullName, setFullName] = useState(
    user.userType === 'persona'
      ? `${user.nombres || ''} ${user.apellidos || ''}`.trim()
      : user.nombre_empresa || ''
  );
  const [email, setEmail] = useState(user.email || '');
  const [dni, setDni] = useState(user.id || '');
  

  // Button States
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);

      // Construct updated user object
      const updatedUser: LoginUser = {
        ...user,
        email: email,
        id: dni,
      };

      if (user.userType === 'persona') {
        const parts = fullName.trim().split(' ');
        updatedUser.nombres = parts[0] || '';
        updatedUser.apellidos = parts.slice(1).join(' ') || '';
      } else {
        updatedUser.nombre_empresa = fullName.trim();
      }

      // Invoke save handler to update top-level React state
      onSave(updatedUser);

      setTimeout(() => {
        setIsSaved(false);
        // Return to lobby view
        onCancel();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="bg-background text-on-background selection:bg-tertiary-fixed selection:text-on-tertiary-fixed font-sans min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline w-full h-20 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <div className="text-headline-sm font-headline-sm text-primary dark:text-primary-fixed flex items-center gap-2 cursor-pointer" onClick={onCancel}>
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span>EcoTax</span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-bold hover:opacity-90 active:scale-95 duration-100 transition-all cursor-pointer" onClick={onCancel}>
              Volver al Lobby
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full py-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Sidebar Navigation */}
          <aside className="col-span-1 md:col-span-3 mb-6 md:mb-0">
            <div className="bg-surface-container-lowest rounded-xl p-stack-md settings-card-shadow flex flex-col space-y-2">
              <button className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-bold transition-all w-full text-left cursor-pointer" id="nav-personal">
                <span className="material-symbols-outlined">person</span>
                <span className="text-body-md">Personal Info</span>
              </button>
              <div className="pt-stack-lg mt-4 border-t border-outline-variant">
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-error hover:bg-error-container transition-all w-full text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-body-md font-body-md">Log Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Settings Canvas */}
          <section className="col-span-1 md:col-span-9 space-y-stack-lg">
            
            {/* Hero Header */}
            <div className="relative h-48 rounded-xl overflow-hidden mb-[-24px] z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
              <img 
                className="w-full h-full object-cover mix-blend-overlay" 
                alt="A lush, forest canopy during sunrise"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgq8eNf_fFP1PTP6E7pYd9obKyka5QPKDbI6eB_yHFBz0OTgwTDNYj0JOvHG1fzciUWpNoebvbT0Ya2cum7zEG_40rvUbt1a4ZlfWdRba9GFyNLPL5m4SPtrjQ5_WjlDYp_Ny_2dZqtRr4erArYiT-m6MQZetlVLcNaum7TevbWMc4wRY4K1VgEYq3DX6g3Vx0Mc_HQyfIrc5kZ0eXIVNX-_QX7gFYBBrGoSHik7tG_3M9AAgkLDvLUB8vx5ziRvH6ohHepyTKR8TP"
              />
              <div className="absolute bottom-6 left-8 flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-surface-container-highest">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="User headshot"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzY1vNDEKpuKArvmq4dZWLxRZJGUiE4Yfso8Wgbg3xq6gP-kxw_dj9UbR8pPjwyI7jMrV40VSa0gXvOuloZDU_EzC_nCf_1wnSGwt5LXecav2M2cVylZ7_loV8taoUBcU-UR2QazxGUCoWmhA-rigt_Ks9vg5-G9hfP3ho_oxzmbxJO-_sMBhciZ401omC-SKdKJdpsxvMJa35hzvrijVYeTOqCEQZUFOxS3_gBLj5UX1xM3zUFUmSGCtGXuzvuq1aoXgEntdGlL8Q"
                  />
                </div>
                <div>
                  <h1 className="text-headline-md font-headline-md text-on-primary">
                    {fullName || 'Usuario EcoTax'}
                  </h1>
                  <p className="text-on-primary opacity-80 text-body-md font-body-md">
                    {user.userType === 'persona' ? 'Environmental Steward • Individual Profile' : 'Corporate Partner • Business Profile'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-lg settings-card-shadow relative z-10">
              <div className="flex justify-between items-center mb-stack-lg">
                <h2 className="text-headline-sm font-headline-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">badge</span>
                  Personal Information
                </h2>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-caps font-label-caps">
                  Verified Account
                </span>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-stack-md">
                <div className="flex flex-col space-y-1">
                  <label className="text-label-bold font-label-bold text-on-surface-variant">
                    {user.userType === 'persona' ? 'Full Name' : 'Company Name'}
                  </label>
                  <input 
                    className="rounded-lg border-outline-variant bg-surface-bright focus:border-primary focus:ring-primary h-11 text-body-md" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-label-bold font-label-bold text-on-surface-variant">Email Address</label>
                  <input 
                    className="rounded-lg border-outline-variant bg-surface-bright focus:border-primary focus:ring-primary h-11 text-body-md" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-label-bold font-label-bold text-on-surface-variant">
                    {user.userType === 'persona' ? 'ID / DNI Number' : 'RIF Number'}
                  </label>
                  <input 
                    className="rounded-lg border-outline-variant bg-surface-bright focus:border-primary focus:ring-primary h-11 text-body-md" 
                    type="text" 
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                  />
                </div>




                {/* Action Bar */}
                <div className="col-span-1 md:col-span-2 flex justify-end items-center space-x-4 pt-stack-lg border-t border-outline-variant mt-4">
                  <button 
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 rounded-lg border border-outline text-on-surface-variant font-label-bold hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer"
                  >
                    Cancel Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-lg font-label-bold shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                      isSaved 
                        ? 'bg-secondary-container text-on-secondary-container' 
                        : 'bg-primary text-on-primary hover:opacity-90'
                    }`}
                  >
                    {isSaving && (
                      <span className="material-symbols-outlined animate-spin">sync</span>
                    )}
                    {isSaved && (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                    {!isSaving && !isSaved && (
                      <span className="material-symbols-outlined text-white">save</span>
                    )}
                    {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary dark:bg-primary-container w-full mt-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-headline-sm font-headline-sm text-on-primary dark:text-on-primary-container">EcoTax</div>
            <p className="text-body-sm font-body-sm text-on-primary dark:text-on-primary-container opacity-80 mt-2">
              © 2026 EcoTax. Stewardship through fiscal responsibility.
            </p>
          </div>
          <div className="flex space-x-8">
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Annual Reports</a>
            <a className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:text-tertiary-fixed transition-colors text-body-sm font-body-sm" href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
