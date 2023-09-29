import { LINE_AUTH_FQDN, LINE_CLIENT_ID, LINE_REDIRECT_URL, LINE_RESPONSE_TYPE, LINE_DEFAULT_STATE, LINE_DEFAULT_SCOPE } from './config';

export function getLineAuthorizeUrl(state: string = LINE_DEFAULT_STATE) {
    return `${LINE_AUTH_FQDN}?response_type=${LINE_RESPONSE_TYPE}&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINE_REDIRECT_URL)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(LINE_DEFAULT_SCOPE)}`
}
