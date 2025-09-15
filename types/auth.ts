export interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in: number;
  refresh_token?: string | null;
  scope?: string | null;
  id_token?: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

export interface VerifyCodeParams {
  email: string;
  code: string;
  challenge: string;
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface IDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
  qr_data: any;
}

export interface IQrSession {
  session_id: string;
  public_key: string;
  expires_in: number;
}

export interface ILoginSession extends IDeviceCodeResponse, IQrSession {}
