'use client';

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Anchor,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShipWheel,
  UserRound,
  Waves
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/button';
import { InlineAlert } from '@/shared/components/inline-alert';
import { OtpInput } from '@/shared/components/otp-input';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { findSeedPhoneByEmail } from '@/shared/mock-data/mock-user-registry';
import { login, register } from '../../services/auth.client';
import type { OtpChallengeResponse, PublicUserRole, RegisterOtpChallengeResponse } from '../../domain/auth.types';
import type { AuthDialCode } from './auth-dial-options';
import { loginCredentialsSchema, otpCodeSchema, registerSchema } from '../../domain/auth-schemas';
import { buildPhoneE164, looksLikeEmail, normalizePhoneDigits } from '../../domain/auth-normalization';
import { PhoneInput } from './phone-input';
import styles from './auth-form.module.sass';

function resolvePostLoginHref(nextParam: string | null, locale: string): string {
  const fallback = intlAppPaths.dashboard.home;
  if (!nextParam) return fallback;
  let decoded = nextParam;
  try {
    decoded = decodeURIComponent(nextParam);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;
  const prefix = `/${locale}`;
  if (decoded !== prefix && !decoded.startsWith(`${prefix}/`)) return fallback;
  if (decoded === prefix) return intlAppPaths.home;
  return decoded.slice(prefix.length) || fallback;
}

type Mode = 'login' | 'register';

type AuthFormProps = {
  mode: Mode;
  registerPrefill?: string;
  /** Query `prefill` on login (digits or email), same shape as cadastro. */
  loginPrefill?: string;
};

function isOtpChallengeResult(value: unknown): value is OtpChallengeResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OtpChallengeResponse>;
  return candidate.otpRequired === true && typeof candidate.challenge === 'string' && typeof candidate.expiresAt === 'string';
}

function resolveMockOtpCode(value: OtpChallengeResponse | RegisterOtpChallengeResponse): string {
  const root = value as unknown as Record<string, unknown>;
  const challengeValue = root.challenge;
  const challengeObject = typeof challengeValue === 'object' && challengeValue !== null
    ? challengeValue as Record<string, unknown>
    : null;

  const candidates = [
    root.otpCode,
    root.mockOtpCode,
    root.code,
    challengeObject?.otpCode,
    challengeObject?.mockOtpCode,
    challengeObject?.code
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const digits = candidate.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) return digits;
  }

  return '';
}

type RoleOption = PublicUserRole | '';

function initialRegisterContact(prefill?: string) {
  if (!prefill || typeof prefill !== 'string') return { email: '', phone: '' };
  if (looksLikeEmail(prefill)) return { email: prefill, phone: '' };
  return { email: '', phone: prefill.replace(/\D/g, '') };
}

function translateZodIssue(message: string, t: ReturnType<typeof useTranslations<'auth'>>, field?: string): string {
  if (field === 'role') return t('errorRoleRequired');

  const map: Record<string, string> = {
    'invalid-email': 'errorEmailInvalid',
    'password-too-short': 'errorPasswordMin',
    'full-name-required': 'errorFullNameRequired',
    'full-name-must-have-two-words': 'errorFullNameTwoWords',
    'invalid-country-code': 'errorCountryCode',
    'invalid-phone': 'errorPhone',
    'invalid-phone-e164': 'errorPhone',
    'company-required': 'errorCompanyRequired',
    'identifier-required': 'errorPhoneRequired',
    'invalid-identifier': 'errorPhone',
    'invalid-otp': 'otpInvalid',
    'challenge-required': 'otpInvalid'
  };
  const key = map[message];
  return key ? t(key) : t('errorValidation');
}

function formatPhoneLabel(countryCode: string, phone: string) {
  const national = normalizePhoneDigits(phone);
  return `${countryCode} ${national}`.trim();
}

function fieldHintId(field: string) {
  return `auth-field-hint-${field}`;
}

function FieldFeedback({
  field,
  error,
  hint
}: {
  field: string;
  error?: string;
  hint: string;
}) {
  const hintId = fieldHintId(field);
  if (error) {
    return (
      <p className={styles.fieldIssue} id={hintId} role="alert">
        {error}
      </p>
    );
  }

  return (
    <p className={styles.srOnly} id={hintId}>
      {hint}
    </p>
  );
}

export function AuthForm({ mode, registerPrefill, loginPrefill }: AuthFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [completedMode, setCompletedMode] = useState<Mode | null>(null);
  const [challenge, setChallenge] = useState('');
  const [otpCodeHint, setOtpCodeHint] = useState('');
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<RoleOption>('');
  const [email, setEmail] = useState(() =>
    mode === 'register' ? initialRegisterContact(registerPrefill).email : initialRegisterContact(loginPrefill).email
  );
  const [countryCode, setCountryCode] = useState<AuthDialCode>('+55');
  const [phone, setPhone] = useState(() =>
    mode === 'register' ? initialRegisterContact(registerPrefill).phone : initialRegisterContact(loginPrefill).phone
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const reduceMotion = useReducedMotion();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const roleListboxId = useId();
  const registerRedirectRef = useRef(false);
  const loginFromRegisterPhoneRef = useRef(false);
  const completionTimeoutRef = useRef<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const otpSlotsBox = useMemo(
    () => ({
      slots: Array.from({ length: 6 }, (): HTMLInputElement | null => null)
    }),
    []
  );

  const phoneNormalized = useMemo(() => normalizePhoneDigits(phone), [phone]);
  const phoneE164 = useMemo(() => buildPhoneE164(countryCode, phoneNormalized), [countryCode, phoneNormalized]);

  const registerDraft = useMemo(
    () => ({
      fullName,
      email,
      password,
      countryCode,
      phone: phoneNormalized,
      phoneE164,
      role,
      company
    }),
    [fullName, email, password, countryCode, phoneNormalized, phoneE164, role, company]
  );

  const loginDraft = useMemo(
    () => ({
      email,
      countryCode,
      phone: phoneNormalized,
      phoneE164,
      password
    }),
    [email, countryCode, phoneNormalized, phoneE164, password]
  );

  const isOtpReady = useMemo(() => otpCodeSchema.safeParse(otp.replace(/\D/g, '')).success, [otp]);
  const phoneLabel = formatPhoneLabel(countryCode, phone);
  useEffect(() => {
    if (mode !== 'login' || typeof window === 'undefined') return;
    const handle = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        if (!raw) return;
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        const parsed = JSON.parse(raw) as { email?: string; identifier?: string; password?: string };
        const emailOrIdentifier = parsed.email ?? parsed.identifier ?? '';
        if (looksLikeEmail(emailOrIdentifier)) {
          const seedPhoneRaw = findSeedPhoneByEmail(emailOrIdentifier);
          const seedPhone = seedPhoneRaw
            ? {
                countryCode: (seedPhoneRaw.countryCode as AuthDialCode | undefined) ?? '+55',
                phone: seedPhoneRaw.phone
              }
            : null;
          if (seedPhone) {
            setEmail(emailOrIdentifier.trim().toLowerCase());
            setCountryCode(seedPhone.countryCode);
            setPhone(seedPhone.phone);
          }
        }
        if (typeof parsed.password === 'string') setPassword(parsed.password);
      } catch {
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [mode]);

  useEffect(() => {
    if (!roleMenuOpen) return undefined;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!roleMenuRef.current?.contains(target)) setRoleMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [roleMenuOpen]);

  useEffect(() => {
    if (!otpStage || !expiresAtMs) return undefined;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpStage, expiresAtMs]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const eyebrow = otpStage
    ? t('otpEyebrow')
    : mode === 'login'
      ? t('loginEyebrow')
      : t('registerEyebrow');

  const title = completedMode
    ? completedMode === 'login'
      ? t('successLoginTitle')
      : t('successRegisterTitle')
    : otpStage
      ? t('otpTitle')
      : mode === 'login'
        ? t('loginTitle')
        : t('registerTitle');

  const description = completedMode
    ? completedMode === 'login'
      ? t('successLoginDescription')
      : t('successRegisterDescription')
    : otpStage
      ? mode === 'login'
        ? t('otpDescription')
        : t('otpDescriptionRegister')
      : mode === 'login'
        ? t('loginDescription')
        : t('registerDescription');

  function clearInlineMessages() {
    setError('');
    setSuccess('');
  }

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function resetOtpStage() {
    setOtpStage(false);
    setChallenge('');
    setOtpCodeHint('');
    setOtp('');
    setExpiresAtMs(null);
    setSecondsLeft(0);
    setCopied(false);
    clearInlineMessages();
  }

  function completeFlow(nextMode: Mode) {
    setCompletedMode(nextMode);
    setOtpStage(false);
    setChallenge('');
    setOtp('');
    setCopied(false);
    setSuccess(nextMode === 'login' ? t('loginSuccess') : t('registerSuccess'));

    const destination =
      nextMode === 'login'
        ? resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale)
        : intlAppPaths.dashboard.home;

    completionTimeoutRef.current = window.setTimeout(() => {
      router.push(destination);
    }, 1600);
  }

  function applyRegisterValidation() {
    const result = registerSchema.safeParse(registerDraft);
    if (result.success && role) {
      setFieldErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    if (!role) next.role = t('errorRoleRequired');
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key]) {
          next[key] = translateZodIssue(issue.message, t, key);
        }
      }
    }
    setFieldErrors(next);
    return false;
  }

  function applyLoginValidation() {
    const result = loginCredentialsSchema.safeParse(loginDraft);
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !next[key]) {
        next[key] = translateZodIssue(issue.message, t, key);
      }
    }
    setFieldErrors(next);
    return false;
  }

  function applyOtpChallenge(result: OtpChallengeResponse | RegisterOtpChallengeResponse) {
    setOtpStage(true);
    setCompletedMode(null);
    setChallenge(result.challenge ?? '');
    setOtpCodeHint(resolveMockOtpCode(result));
    setOtp('');
    setExpiresAtMs(result.expiresAt ? Date.parse(result.expiresAt) : null);
    clearInlineMessages();
    window.setTimeout(() => otpSlotsBox.slots[0]?.focus(), 0);
  }

  async function requestRegisterOtp() {
    if (!applyRegisterValidation()) {
      setError(t('errorFixFields'));
      return;
    }

    loginFromRegisterPhoneRef.current = false;
    setPending(true);
    clearInlineMessages();
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role: role as PublicUserRole,
        countryCode,
        phone: phoneNormalized,
        phoneE164
      });

      if (isOtpChallengeResult(result)) {
        applyOtpChallenge(result);
        return;
      }

      throw new Error('request-failed');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'email-already-registered') setError(t('emailAlreadyRegistered'));
      else if (code === 'phone-already-registered') {
        setError(t('phoneAlreadyRegistered'));
        if (phoneNormalized && !loginFromRegisterPhoneRef.current) {
          loginFromRegisterPhoneRef.current = true;
          window.setTimeout(() => {
            router.replace(`${intlAppPaths.auth.login}?prefill=${encodeURIComponent(phoneNormalized)}`);
          }, 900);
        }
      }
      else if (code === 'forbidden') setError(t('roleInvalidPublic'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  async function requestLoginOtp() {
    if (!applyLoginValidation()) {
      setError(t('errorFixFields'));
      return;
    }

    registerRedirectRef.current = false;
    setPending(true);
    clearInlineMessages();
    try {
      const result = await login({
        email: email.trim(),
        countryCode,
        phone: phoneNormalized,
        phoneE164,
        password
      });
      if (isOtpChallengeResult(result)) {
        applyOtpChallenge(result);
        return;
      }

      throw new Error('request-failed');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'user-not-found') {
        setError(t('userNotFound'));
        if (phone && !registerRedirectRef.current) {
          registerRedirectRef.current = true;
          window.setTimeout(() => {
            router.replace(`${intlAppPaths.auth.register}?prefill=${encodeURIComponent(phone)}`);
          }, 900);
        }
      } else if (code === 'invalid-login') {
        setError(t('invalidCredentials'));
      } else {
        setError(t('error'));
      }
    } finally {
      setPending(false);
    }
  }

  async function resendOtp() {
    setSuccess('');
    setError('');
    try {
      if (mode === 'login') await requestLoginOtp();
      else await requestRegisterOtp();
      setSuccess(t('otpResent'));
    } catch {
      setError(t('error'));
    }
  }

  async function submitOtp() {
    if (!isOtpReady) {
      setFieldErrors({ otp: t('otpInvalid') });
      setError(t('otpInvalid'));
      return;
    }

    setPending(true);
    clearInlineMessages();
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.otp;
      return next;
    });
    try {
      if (mode === 'login') {
        const result = await login({
          email: email.trim(),
          countryCode,
          phone: phoneNormalized,
          phoneE164,
          password,
          otp,
          challenge
        });

        if (!result.user) throw new Error('invalid-otp');
        completeFlow('login');
        return;
      }

      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role: role as PublicUserRole,
        countryCode,
        phone: phoneNormalized,
        phoneE164,
        otp,
        challenge
      });

      if ('otpRequired' in result && result.otpRequired) throw new Error('invalid-otp');
      completeFlow('register');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'invalid-otp') setError(t('otpInvalid'));
      else if (code === 'otp-expired') setError(t('otpExpired'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');

    if (completedMode) {
      const destination =
        completedMode === 'login'
          ? resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale)
          : intlAppPaths.dashboard.home;
      router.push(destination);
      return;
    }

    if (otpStage) {
      await submitOtp();
      return;
    }

    if (mode === 'login') {
      await requestLoginOtp();
      return;
    }

    await requestRegisterOtp();
  }

  function onOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const raw = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(raw);
    const focusIndex = raw.length > 0 ? Math.min(raw.length - 1, 5) : 0;
    otpSlotsBox.slots[focusIndex]?.focus();
  }

  async function copyOtpCode() {
    if (!otpCodeHint) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(otpCodeHint);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = otpCodeHint;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const primaryDisabled = completedMode !== null ? false : pending;

  return (
    <section className={styles.shell}>
      <motion.div
        className={styles.panel}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.brandRow}>
          <div className={styles.brandIcon} aria-hidden>
            <Waves size={22} />
          </div>
          <div className={styles.brandMeta}>
            <strong className={styles.wordmark}>HydroRivers</strong>
            <span className={styles.brandTagline}>{t('authShellTagline')}</span>
          </div>
        </div>
        {!completedMode ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        {!completedMode ? <p className={styles.lead}>{description}</p> : null}

        {!otpStage && !completedMode ? (
          <details className={styles.mockHelp}>
            <summary className={styles.mockHelpSummary}>{t('mockHelpSummary')}</summary>
            <p className={styles.mockHelpBody}>{t('mockHelpBody')}</p>
            <p className={styles.mockHelpNote}>{t('mockMenuHint')}</p>
          </details>
        ) : null}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {completedMode ? (
            <div className={styles.successStage}>
              <span className={styles.successIcon}>
                <CheckCircle2 size={28} aria-hidden />
              </span>
              <div className={styles.successCopy}>
                <strong>{completedMode === 'login' ? t('successLoginBadge') : t('successRegisterBadge')}</strong>
                <p>{completedMode === 'login' ? t('successLoginHint') : t('successRegisterHint')}</p>
              </div>
            </div>
          ) : null}

          {!otpStage && !completedMode && mode === 'register' ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formSectionLegend}>{t('profileSectionTitle')}</legend>
              <div className={styles.formSectionFields}>
                <label className={styles.field}>
                  <span>{t('name')}</span>
                  <div>
                    <UserRound size={18} aria-hidden />
                    <input
                      name="fullName"
                      autoComplete="name"
                      placeholder={t('namePlaceholder')}
                      value={fullName}
                      aria-describedby={fieldHintId('fullName')}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      onChange={(event) => {
                        setFullName(event.target.value);
                        clearFieldError('fullName');
                      }}
                    />
                  </div>
                  <FieldFeedback field="fullName" error={fieldErrors.fullName} hint={t('nameHint')} />
                </label>

                <label className={styles.field}>
                  <span>{t('company')}</span>
                  <div>
                    <Anchor size={18} aria-hidden />
                    <input
                      name="company"
                      autoComplete="organization"
                      placeholder={t('companyPlaceholder')}
                      value={company}
                      aria-describedby={fieldHintId('company')}
                      onChange={(event) => setCompany(event.target.value)}
                    />
                  </div>
                  <FieldFeedback field="company" hint={t('companyOptionalHint')} />
                </label>

                <div className={styles.field}>
                  <span id="role-label">{t('role')}</span>
                  <div className={styles.menuWrap} ref={roleMenuRef}>
                    <button
                      type="button"
                      role="combobox"
                      className={styles.menuTrigger}
                      aria-expanded={roleMenuOpen}
                      aria-haspopup="listbox"
                      aria-controls={roleMenuOpen ? roleListboxId : undefined}
                      aria-labelledby="role-label"
                      aria-describedby={fieldHintId('role')}
                      aria-invalid={Boolean(fieldErrors.role)}
                      onClick={() => setRoleMenuOpen((open) => !open)}
                    >
                      <ShipWheel size={18} aria-hidden />
                      <span className={styles.menuTriggerText}>
                        {role ? (role === 'shipper' ? t('shipperChoice') : t('carrierChoice')) : t('rolePlaceholder')}
                      </span>
                    </button>
                    {roleMenuOpen ? (
                      <div className={styles.menuPanel} id={roleListboxId} role="listbox" aria-labelledby="role-label">
                        <button
                          type="button"
                          role="option"
                          aria-selected={role === 'shipper'}
                          className={role === 'shipper' ? styles.menuOptionActive : styles.menuOption}
                          onClick={() => {
                            setRole('shipper');
                            setRoleMenuOpen(false);
                            clearFieldError('role');
                          }}
                        >
                          <strong>{t('shipperChoice')}</strong>
                          <span className={styles.menuHint}>{t('shipperHint')}</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={role === 'carrier'}
                          className={role === 'carrier' ? styles.menuOptionActive : styles.menuOption}
                          onClick={() => {
                            setRole('carrier');
                            setRoleMenuOpen(false);
                            clearFieldError('role');
                          }}
                        >
                          <strong>{t('carrierChoice')}</strong>
                          <span className={styles.menuHint}>{t('carrierHint')}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <FieldFeedback field="role" error={fieldErrors.role} hint={t('roleHint')} />
                </div>
              </div>
            </fieldset>
          ) : null}

          {!otpStage && !completedMode ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formSectionLegend}>{t('accessSectionTitle')}</legend>
              <div className={styles.formSectionFields}>
                {mode === 'register' ? (
                  <label className={styles.field}>
                    <span>{t('email')}</span>
                    <div>
                      <Mail size={18} aria-hidden />
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        aria-describedby={fieldHintId('email')}
                        aria-invalid={Boolean(fieldErrors.email)}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearFieldError('email');
                        }}
                      />
                    </div>
                    <FieldFeedback field="email" error={fieldErrors.email} hint={t('emailHint')} />
                  </label>
                ) : null}

                {mode === 'login' ? (
                  <label className={styles.field}>
                    <span>{t('email')}</span>
                    <div>
                      <Mail size={18} aria-hidden />
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        aria-describedby={fieldHintId('email')}
                        aria-invalid={Boolean(fieldErrors.email)}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearFieldError('email');
                        }}
                      />
                    </div>
                    <FieldFeedback field="email" error={fieldErrors.email} hint={t('emailHint')} />
                  </label>
                ) : null}

                <label className={styles.field}>
                  <span>{t('password')}</span>
                  <div>
                    <LockKeyhole size={18} aria-hidden />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      aria-describedby={fieldHintId('password')}
                      aria-invalid={Boolean(fieldErrors.password)}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError('password');
                      }}
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                      <span className={styles.srOnly}>{showPassword ? t('hidePassword') : t('showPassword')}</span>
                    </button>
                  </div>
                  <FieldFeedback field="password" error={fieldErrors.password} hint={t('passwordHint')} />
                </label>
              </div>
            </fieldset>
          ) : null}

          {!otpStage && !completedMode ? (
            <fieldset className={styles.formSection}>
              <legend className={styles.formSectionLegend}>{t('phoneSectionTitle')}</legend>
              <div className={styles.formSectionFields}>
                <div className={`${styles.field} ${styles.phoneFieldContainer}`}>
                  <span id="phone-label">{mode === 'login' ? t('loginPhoneLabel') : t('phoneWithPrefix')}</span>
                  <PhoneInput
                    countryCode={countryCode}
                    phone={phone}
                    mode={mode}
                    invalid={Boolean(fieldErrors.phone || fieldErrors.phoneE164 || fieldErrors.countryCode)}
                    describedBy={fieldHintId('phone')}
                    onCountryChange={(nextCountryCode) => {
                      setCountryCode(nextCountryCode);
                      setPhone('');
                      clearFieldError('countryCode');
                      clearFieldError('phone');
                      clearFieldError('phoneE164');
                    }}
                    onPhoneChange={(nextPhone) => {
                      setPhone(nextPhone);
                      clearFieldError('phone');
                      clearFieldError('phoneE164');
                    }}
                  />
                  <FieldFeedback
                    field="phone"
                    error={fieldErrors.phone ?? fieldErrors.phoneE164 ?? fieldErrors.countryCode}
                    hint={mode === 'register' ? `${t('phoneHint')} ${t('registerPhoneOtpHint')}` : t('phoneHint')}
                  />
                </div>
                {mode === 'login' ? <p className={styles.returningHelper}>{t('returningUserHelper')}</p> : null}
              </div>
            </fieldset>
          ) : null}

          {otpStage && !completedMode ? (
            <div className={styles.otpStage}>
              <div className={styles.otpStageHeader}>
                <div>
                  <strong>{t('otpPhoneBadge')}</strong>
                  <p>{phoneLabel}</p>
                </div>
                <button type="button" className={styles.secondaryAction} onClick={resetOtpStage}>
                  <ArrowLeft size={16} aria-hidden /> {t('changeCredentials')}
                </button>
              </div>

              <div className={styles.otpBox}>
                <div className={styles.otpHeader}>
                  <div>
                    <span className={styles.otpDevBadge}>{t('otpDevBadge')}</span>
                    <p className={styles.otpMockLead}>{mode === 'login' ? t('otpSentLoginBody') : t('otpSentRegisterBody')}</p>
                  </div>
                  <motion.button
                    type="button"
                    className={styles.copyButton}
                    onClick={copyOtpCode}
                    disabled={!otpCodeHint}
                    aria-label={t('copyOtp')}
                    animate={copied && !reduceMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {copied ? t('otpCodeCopied') : t('copyOtp')} <Copy size={15} aria-hidden />
                  </motion.button>
                </div>
                <div className={styles.otpCode} aria-live="polite" aria-label={t('otpMockBlockTitle')}>
                  {otpCodeHint || t('otpCodeUnavailable')}
                </div>
                <p className={styles.otpCodeHelp}>{t('otpCodeHelp')}</p>
              </div>

              <div className={styles.otpStageCard}>
                <div className={styles.otpMeta}>
                  <strong>{t('otpInputLabel')}</strong>
                  <span>{secondsLeft > 0 ? t('otpExpiresIn', { seconds: secondsLeft }) : t('otpTimerExpired')}</span>
                </div>
                <p className={styles.srOnly} id="auth-otp-hint">
                  {t('otpHint')}
                </p>

                <OtpInput
                  value={otp}
                  onChange={(nextOtp) => {
                    setOtp(nextOtp);
                    clearFieldError('otp');
                  }}
                  onPaste={onOtpPaste}
                  disabled={pending}
                  invalid={Boolean(fieldErrors.otp || error)}
                  groupLabel={t('otpInputLabel')}
                  digitAriaLabel={(index) => `${t('otpDigitAria')} ${index}`}
                  describedBy={
                    fieldErrors.otp || error
                      ? 'auth-form-error auth-otp-hint auth-otp-field-error'
                      : 'auth-otp-hint'
                  }
                  slotsBox={otpSlotsBox}
                />

                {fieldErrors.otp ? (
                  <p className={styles.fieldIssue} id="auth-otp-field-error" role="alert">
                    {fieldErrors.otp}
                  </p>
                ) : null}

                <div className={styles.otpFooter}>
                  <p>{t('otpResendHint')}</p>
                  <button type="button" className={styles.secondaryAction} onClick={resendOtp} disabled={pending}>
                    {t('resendOtp')}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <InlineAlert tone="error" id="auth-form-error">
              {error}
            </InlineAlert>
          ) : null}
          {success ? <InlineAlert tone="success">{success}</InlineAlert> : null}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className={styles.submit}
            disabled={primaryDisabled}
            isLoading={pending}
          >
            {completedMode
              ? t('successContinue')
              : otpStage
                ? pending
                  ? t('loading')
                  : t('otpSubmit')
                : mode === 'login'
                  ? pending
                    ? t('loading')
                    : t('continueToOtp')
                  : pending
                    ? t('loading')
                    : t('signup')}
          </Button>
        </form>

        {!completedMode ? (
          <nav className={styles.authSwitchNav} aria-label={t('authSwitchNavAria')}>
            {mode === 'login' ? (
              <Link href={intlAppPaths.auth.register} className={styles.authSwitchLink}>
                {t('goToRegisterCta')}
              </Link>
            ) : (
              <Link href={intlAppPaths.auth.login} className={styles.authSwitchLink}>
                {t('goToLoginCta')}
              </Link>
            )}
          </nav>
        ) : null}
      </motion.div>
    </section>
  );
}
