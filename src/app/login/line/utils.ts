import { request } from 'https';
import qs from 'querystring';
import { LINE_CLIENT_ID, LINE_CLIENT_SECRET, LINE_REDIRECT_URL } from '../config';

export function getLineToken(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const req = request({
            hostname: 'api.line.me',
            port: 443,
            method: 'POST',
            path: '/oauth2/v2.1/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }, (res) => {
            const chunks: any[] = [];
            res.on('data', (chunk) => {
                chunks.push(chunk)
            });

            res.on('end', () => {
                const body = Buffer.concat(chunks);
                resolve(body.toString());
            });

            res.on('error', (error) => {
                console.error('ERror on get LINE token', error.message);
                reject(error);
            });
        });
        var postData = qs.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: LINE_REDIRECT_URL,
            client_id: LINE_CLIENT_ID,
            client_secret: LINE_CLIENT_SECRET,
        });

        req.write(postData);
        req.end();
    });
}
