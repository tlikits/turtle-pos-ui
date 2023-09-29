export const APP_FQDN = process.env.NEXT_PUBLIC_APP_FQDN;

export const LINE_AUTH_FQDN = 'https://access.line.me/oauth2/v2.1/authorize';
export const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
export const LINE_CLIENT_SECRET = process.env.LINE_CLIENT_SECRET; // TODO: review where to put this secret
export const LINE_RESPONSE_TYPE = 'code';
export const LINE_DEFAULT_SCOPE = 'openid email profile'
export const LINE_REDIRECT_URL = `${APP_FQDN}/login/line/token`;
export const LINE_DEFAULT_STATE = 'my-test-state';
