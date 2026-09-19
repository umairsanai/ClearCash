/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css";
declare module "validator" {
  const validator: {
    isEmail(value: string): boolean;
  };
  export default validator;
}
