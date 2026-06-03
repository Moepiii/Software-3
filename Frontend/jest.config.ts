import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  // Especificamos el entorno DOM completo para React
  testEnvironment: 'jest-environment-jsdom', 
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    // Evita que Jest choque si importas archivos CSS en tus componentes
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    // Esto procesa los archivos .ts y .tsx inyectando directamente las reglas que Jest necesita
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true, // Esto quita la advertencia de TS151001 sobre los imports
        },
      },
    ],
  },
};

export default config;
