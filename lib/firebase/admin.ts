import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Service account credentials (hardcoded)
const serviceAccount = {
  type: "service_account",
  project_id: "autoecoli",
  private_key_id: "34ad8f3695e92316547d682cf4f67a043acdef37",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCe+27yXiGvnfYN\n1VQGLa9kIDXMHyI2hWdwvkcqTWezXwSlQJcW1DRrB8TjGmM+6QU6Xop8h7PYlvfA\nvxYcl6FiCNrnlDqgMxI0bMuJq8X9FLEaV7lnrlz+VGSenYu2VziQastrXrO/UAki\n5h/kzUQGYVhH/Lxzg3t1OsMDDA8+ndq/VeEXTmIvIu1u6e2sNGBRfJ/vsd+4YAtt\n58BITr7ZMkOjWYerW3QiJRrtoLqUhDVY1QAMWZLwA5HV0fwPypeazzs2UX7EvCX0\nzpgvKg8Se2TdTj79NQQcj4aUvFDkzkRh/5FLonhZuHlqSjCiF+PKq9lBVOLRa0Mt\nqc5vD0xHAgMBAAECggEASA3/F9wv+k9mgJiKT46PKpsqpswJjpph6ohi6rpQYMyU\n52zhzZf59fR8eM2x44ZrNyw4Kf67NVQfD/3LQMQ8gZkv1bup4oejHZ2dllUDFBQ3\nvI+72VD+lsqbHASdmNPpMBMnBQ/T+caFjYqtM98QkK+3+lCC/Pu/jb9HOW9SzXa4\nnI3tMriwyAXVivjyWOZZPRpKW2xYJ0RxXXOrcsHsYo2e1Zfe4aJC+VfIX1C2ZZvZ\nAi0kkM7wDUKDIJ15IRIXKoCB+cR5syvxbrYg/dJemJR2BR/x8ij66xkB8IYAoNLU\nYInQh94d9YgkPOnH6yEoGKRKUkxdmYHQ8883s6FySQKBgQDZD6OkETSgVz+QcVgl\nrPpU1mUIH7wETjky4UI0ZvqwjixnDxeOjNPuKRln2xm0a42iFGF0kFXNntX7W/xz\nqbFo+qmlm3wlCBv8Yxn+5Cd3EY6TblvOR4/GQiq6WMDl1e72usVtMwJcrilA0bAx\n6WGf9QMI0hdUtpXXZq0+muClHQKBgQC7gJCVq3WKpK3sNVqTc0nIBMmzxhPNTPa9\nXfe8G0S0bBWCgPIiaCp9ARSURLjF//zsAUAX/HiziPzWWzcoltFX9J7/+4fmNO2N\nfzJFH6WEbCY4yIVjRawpZn2cT1t6/tijrncTBn6rT83qSVgdjR4/RLmI4s+MJA+I\nXCgmjaDtswKBgQCw4EmcvFiCABbQAUyvBtHGqB4UDKgNaiC6EUz9npzRmkkcgfPU\nOXXJMLx/IM9Fcg8r8Cep8KO6tp/v//kr1y+2N+xeAuGa24zSkX7xccGnCSuBgABX\ni4DhMbHXv9MQdtAPRgry/QoDs/fx1e0Z/u+KhQFAAtL4OQDJUeYCifpdEQKBgFFP\nW2PMStiouVNpf7HZmPFIQj/XcdbhvU45ZakJGi4zgNBrIpWRHnu+8DGr64TRkdi2\nYhkEv0L78Mj0HWNYo8fEqP7REQnfgfSOaDpZkuluDNUq/80g9ZuuemJCd6VKxp+U\nlMaHVn7ryJwE2lVWUPuWze5yjRZ0vNehPzgYyuTJAoGBAL1nMaqd/CXNrcyQgWqD\ngzy8ysE3dDlTLQujsV4hBQWZCIanWlUYN6yFdZBcGTFEocqt0KPFkfEfquHrwuo9\nOceQ16MHVKsmMRPAchE+ntVzgxJWbIuV2gwVpZhS9dXS7Mpw2I8UxuNWb1naDaHf\ndE/iUz0aa05BFlo2M+t5VHq0\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@autoecoli.iam.gserviceaccount.com",
  client_id: "106221211663326022034",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40autoecoli.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin only if it hasn't been initialized already
let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(serviceAccount as any),
    projectId: "autoecoli"
  });
} else {
  adminApp = getApps()[0];
}

// Initialize Firebase Admin services
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export default adminApp;

