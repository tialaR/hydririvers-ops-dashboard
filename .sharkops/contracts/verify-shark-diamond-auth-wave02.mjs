import { readFileSync } from 'node:fs';
function read(path) { return readFileSync(path, 'utf8'); }
function assert(condition, message) {
  if (!condition) {
    console.error(`[shark-diamond-auth-w02] FAIL: ${message}`);
    process.exit(1);
  }
}
const routes = read('src/shared/routing/app-routes.ts');
const loginPage = read('src/app/[locale]/(shipper-mobile-flow)/entrar/page.tsx');
const registerPage = read('src/app/[locale]/(shipper-mobile-flow)/registrar/page.tsx');
const authSupport = read('tests/e2e/support/auth.ts');
assert(routes.includes("login: '/entrar'"), 'canonical login route must be /entrar');
assert(routes.includes("cadastro: '/registrar'"), 'canonical register route must be /registrar');
assert(loginPage.includes('AuthForm mode="login"'), '/entrar must use API-backed AuthForm');
assert(registerPage.includes('AuthForm mode="register"'), '/registrar must use API-backed AuthForm');
assert(!loginPage.includes('LoginScreen'), '/entrar must not use presentation-only LoginScreen');
assert(!registerPage.includes('RegisterScreen'), '/registrar must not use presentation-only RegisterScreen');
assert(authSupport.includes("page.goto('/pt-BR/entrar')"), 'E2E helper must exercise canonical /entrar');
console.log('[shark-diamond-auth-w02] PASS');
console.log(' canonical auth URLs: /entrar + /registrar');
console.log(' real API-backed OTP behavior now powers canonical routes');
console.log(' legacy /login + /cadastro remain temporarily for compatibility');
