import { NextResponse } from 'next/server';
import { getLineAuthorizeUrl } from '../utils';

export async function GET() {
    const url = getLineAuthorizeUrl();
    return NextResponse.redirect(url)
}
// https://access.line.me/oauth2/v2.1/authorize?response_type=code&clinet_id=2000852281&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2Fline%2Ftoken&state=my-test-state&scope=openid%2520email%2520profile