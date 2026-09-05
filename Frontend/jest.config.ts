import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  // Especificamos el entorno DOM completo para React
  testEnvironment: 'jest-environment-jsdom', 
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  
  // Añadimos los patrones para ignorar carpetas
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/' // <--- Esto le dice a Jest que ignore tu carpeta "test" por completo
  ],

  moduleNameMapper: {
    // Evita que Jest choque si importas archivos CSS en tus componentes
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(png|jpe?g|gif|webp|svg)$': '<rootDir>/src/test/fileMock.ts',
  },
  transform: {
    // Esto procesa los archivos .ts y .tsx inyectando directamente las reglas que Jest necesita
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true, // Esto quita la advertencia de TS151001 sobre los imports
          types: ['jest', 'vite/client'],
        },
      },
    ],
  },
};

export default config;
