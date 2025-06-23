/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_CLIENT_ID: string
  readonly REACT_APP_TENANT_ID: string
  readonly REACT_APP_REDIRECT_URI: string
  readonly REACT_APP_API_SCOPE: string
  readonly REACT_APP_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
