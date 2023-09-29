import admin from 'firebase-admin';
import jwtDecode from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { APP_FQDN } from '../../config';
import { getLineToken } from '../utils';
import { UserRecord } from 'firebase-admin/auth';

const serviceAccount = require('../../../../serviceAccountKey.json');

const app: admin.app.App = initializeFirebaseAdmin();
const auth: admin.auth.Auth = app.auth();

export async function GET(req: NextRequest) {
    const { url } = req;
    const incomingUrl = new URL(url);
    const code = incomingUrl.searchParams.get('code');
    if (!code) {
        return NextResponse.json({ error: 'no code' });
    }
    const response = await getLineToken(code);
    const parsedLineTokenResponse = JSON.parse(response);
    const { access_token, id_token } = parsedLineTokenResponse;
    const idTokenDecodeResult = jwtDecode(id_token) as any;
    const { sub: uid, name, picture } = idTokenDecodeResult;
    const userRecord = await getFirebaseUser(uid, name, picture);
    const firebaseToken = await auth.createCustomToken(userRecord.uid);
    return NextResponse.redirect(`${APP_FQDN}/login/firebase/token?token=${firebaseToken}`);
}

function getFirebaseUser(lineId: string, name: string, picture: string): Promise<UserRecord | never> {
    const firebaseUid = `line:${lineId}`;
    return app.auth()
        .getUser(firebaseUid)
        .catch(error => {
            if (error.code === 'auth/user-not-found') {
                return auth.createUser({
                    uid: firebaseUid,
                    displayName: name,
                    photoURL: picture,
                });
            }
            console.error('Error on get Firebase User', error.message);
            return Promise.reject(error);
        });
}

function initializeFirebaseAdmin(): admin.app.App {
    if (admin.apps.length > 0 && admin.apps[0] !== null) {
        return admin.apps[0];
    } else {
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}