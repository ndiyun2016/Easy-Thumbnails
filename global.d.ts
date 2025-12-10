declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
}

// This `export {}` makes the file a module, which can sometimes be necessary
// for global declarations to be picked up correctly in certain TypeScript configurations.
export {};