'use client';

import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import {
  BellRing,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Mail,
  MapPin,
  Shield,
  ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/button';
import { InlineAlert } from '@/shared/components/inline-alert';
import { Surface } from '@/shared/components/surface';
import { Badge } from '@/shared/ui/badge/badge';
import { useAuthSession } from '../../hooks/use-auth-session';
import { updateProfile } from '../../services/auth.client';
import type { HydroUser } from '../../domain/auth.types';
import { profileFormSchema } from '../../domain/profile.schema';
import { getCompactUserDisplayName } from '../../domain/user-display-name';
import styles from './profile-panel.module.scss';

type ProfileFormState = Pick<HydroUser, 'name' | 'email' | 'company' | 'phone' | 'city' | 'avatarUrl'>;

const emptyProfile: ProfileFormState = {
  name: '',
  email: '',
  company: '',
  phone: '',
  city: '',
  avatarUrl: ''
};

const PROFILE_GUIDANCE_PANEL_ID = 'profile-guidance-panel';

async function fileToOptimizedJpegDataUrl(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxSize = 640;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas-context-unavailable');

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'HR';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${last}`.toUpperCase();
}

function DetailRow({ icon: Icon, label, hint, value }: { icon: LucideIcon; label: string; hint: string; value: string }) {
  return (
    <div className={styles.row}>
      <Icon aria-hidden className={styles.rowIcon} />
      <div className={styles.rowText}>
        <small>{label}</small>
        <p className={styles.rowHint}>{hint}</p>
        <strong className={styles.rowValue}>{value}</strong>
      </div>
    </div>
  );
}

function GuidanceItem({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className={styles.guidanceItem}>
      <Icon aria-hidden className={styles.guidanceItemIcon} />
      <div className={styles.guidanceItemText}>
        <strong className={styles.guidanceItemTitle}>{title}</strong>
        <p className={styles.guidanceItemBody}>{body}</p>
      </div>
    </div>
  );
}

export function ProfilePanel() {
  const t = useTranslations('pages.profile');
  const perfil = useTranslations('pages.perfil');
  const auth = useTranslations('auth');
  const formIds = useId();
  const nameId = `${formIds}-name`;
  const emailId = `${formIds}-email`;
  const companyId = `${formIds}-company`;
  const phoneId = `${formIds}-phone`;
  const cityId = `${formIds}-city`;

  const { user, ready } = useAuthSession();
  const [draftByUser, setDraftByUser] = useState<Record<string, ProfileFormState>>({});
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [avatarPreviewFailedSrc, setAvatarPreviewFailedSrc] = useState<string | null>(null);
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseProfile: ProfileFormState = user
    ? {
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phoneE164 ?? user.phone ?? '',
        city: user.city ?? '',
        avatarUrl: user.avatarUrl ?? ''
      }
    : emptyProfile;

  const profile = user ? (draftByUser[user.id] ?? baseProfile) : emptyProfile;
  const avatarPreviewAvailable = Boolean(profile.avatarUrl) && avatarPreviewFailedSrc !== profile.avatarUrl;
  const displayName = getCompactUserDisplayName(profile.name) || profile.name;

  function updateField(field: keyof ProfileFormState, value: string) {
    if (!user) return;
    setSaved(false);
    setDraftByUser((current) => ({
      ...current,
      [user.id]: { ...(current[user.id] ?? baseProfile), [field]: value }
    }));
  }

  async function persistProfile(nextProfile: ProfileFormState) {
    if (!user) return;
    const updated = await updateProfile({
      ...user,
      ...nextProfile,
      avatarUrl: nextProfile.avatarUrl || undefined
    });

    setDraftByUser((current) => ({
      ...current,
      [user.id]: {
        name: updated.name,
        email: updated.email,
        company: updated.company,
        phone: updated.phoneE164 ?? updated.phone ?? '',
        city: updated.city ?? '',
        avatarUrl: updated.avatarUrl ?? ''
      }
    }));
    setSaved(true);
  }

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file || !user) return;

    setAvatarError('');

    const isJpeg = file.type === 'image/jpeg' || /\.(jpe?g)$/i.test(file.name);
    if (!isJpeg) {
      setAvatarError(auth('avatarInvalidType'));
      setSaved(false);
      resetFileInput();
      return;
    }

    try {
      const avatarUrl = await fileToOptimizedJpegDataUrl(file);
      setDraftByUser((current) => ({
        ...current,
        [user.id]: { ...(current[user.id] ?? baseProfile), avatarUrl }
      }));
      setSaved(false);
      resetFileInput();
    } catch {
      setAvatarError(auth('avatarReadError'));
      resetFileInput();
    }
  }

  function removeAvatar() {
    if (!user) return;
    setAvatarError('');
    setDraftByUser((current) => ({
      ...current,
      [user.id]: { ...(current[user.id] ?? baseProfile), avatarUrl: '' }
    }));
    setSaved(false);
    setIsAvatarViewerOpen(false);
    resetFileInput();
  }

  function mapProfileIssueToMessage(code: string | undefined) {
    if (code === 'invalid-email') return auth('errorEmailInvalid');
    if (code === 'profile-name-required') return auth('errorValidation');
    if (code === 'profile-company-required') return auth('errorValidation');
    if (code === 'profile-phone-required') return auth('errorProfilePhoneRequired');
    if (code === 'profile-phone-no-country' || code === 'profile-phone-invalid' || code === 'invalid-phone-e164') {
      return auth('errorProfilePhoneCountryCode');
    }
    if (code === 'profile-city-required') return auth('errorProfileCityRequired');
    return auth('errorValidation');
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setAvatarError('');
    setProfileError('');

    const parsed = profileFormSchema.safeParse(profile);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setProfileError(mapProfileIssueToMessage(issue?.message));
      setSaved(false);
      return;
    }

    setPending(true);

    try {
      await persistProfile(parsed.data);
    } catch {
      setAvatarError(auth('avatarSaveError'));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!guidanceOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGuidanceOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guidanceOpen]);

  if (!ready) {
    return (
      <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
        <p className={styles.inlineStatus}>{t('loading')}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
        <p className={styles.inlineLead}>{t('loginRequired')}</p>
        <p className={styles.inlineMuted}>{t('loginRequiredDescription')}</p>
      </main>
    );
  }

  return (
    <main className={styles.shell} aria-label={perfil('mainAriaLabel')}>
      <section className={styles.grid}>
        <Surface tone="glass" className={styles.identity}>
          <button
            type="button"
            className={`${styles.avatar} ${avatarPreviewAvailable ? styles.avatarButton : ''}`}
            onClick={() => {
              if (!avatarPreviewAvailable) return;
              setIsAvatarViewerOpen(true);
            }}
            aria-label={auth('avatar')}
          >
            {avatarPreviewAvailable ? (
              <NextImage
                src={profile.avatarUrl ?? ''}
                alt=""
                width={220}
                height={220}
                unoptimized
                onError={() => setAvatarPreviewFailedSrc(profile.avatarUrl ?? null)}
              />
            ) : (
              <span>{getInitials(profile.name)}</span>
            )}
          </button>
          <div className={styles.avatarActions}>
            <button type="button" className={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
              <Camera size={18} />
              <span>{auth('avatarUpload')}</span>
            </button>
            <input
              ref={fileInputRef}
              className={styles.hiddenFileInput}
              type="file"
              accept="image/jpeg,.jpg,.jpeg"
              onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
            />
            {profile.avatarUrl ? (
              <button type="button" className={styles.removeAvatar} onClick={removeAvatar}>
                {auth('removeAvatar')}
              </button>
            ) : null}
          </div>
          {avatarError ? (
            <InlineAlert tone="error" className={styles.error}>
              {avatarError}
            </InlineAlert>
          ) : null}
          <h2 className={styles.identityName} title={profile.name}>
            {displayName}
          </h2>
          <p className={styles.identityCompany}>{profile.company}</p>
          <div className={styles.identityStatus}>
            <Badge tone={user.approved ? 'success' : 'warning'}>
              {user.approved ? t('identityAccessBadgeApproved') : t('identityAccessBadgePending')}
            </Badge>
            <p className={styles.identityStatusTitle}>{user.approved ? t('identityReleasedTitle') : t('identityPendingTitle')}</p>
            <p className={styles.identityStatusBody}>{user.approved ? t('identityReleasedBody') : t('identityPendingBody')}</p>
          </div>
        </Surface>
        <Surface tone="glass" className={styles.details}>
          <DetailRow icon={Mail} label={t('detailEmailLabel')} hint={t('detailEmailHint')} value={profile.email} />
          <DetailRow
            icon={Building2}
            label={t('detailCompanyLabel')}
            hint={t('detailCompanyHint')}
            value={profile.company}
          />
          <DetailRow icon={ShieldCheck} label={t('detailRoleLabel')} hint={t('detailRoleHint')} value={auth(user.role)} />
          <DetailRow
            icon={CheckCircle2}
            label={t('detailAreasLabel')}
            hint={t('detailAreasHint')}
            value={user.approved ? t('accessAreasApproved') : t('accessAreasPending')}
          />
        </Surface>
        <Surface tone="glass" className={styles.formCard}>
          <h2 className={styles.formHeading}>{t('formSectionTitle')}</h2>
          <p className={styles.formLead}>{t('formSectionLead')}</p>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <label className={styles.field} htmlFor={nameId}>
              <span className={styles.fieldLabel}>{t('formNameLabel')}</span>
              <span className={styles.fieldHint}>{t('formNameHint')}</span>
              <input id={nameId} name="name" value={profile.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label className={styles.field} htmlFor={emailId}>
              <span className={styles.fieldLabel}>{t('formEmailLabel')}</span>
              <span className={styles.fieldHint}>{t('formEmailHint')}</span>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>
            <label className={styles.field} htmlFor={companyId}>
              <span className={styles.fieldLabel}>{t('formCompanyLabel')}</span>
              <span className={styles.fieldHint}>{t('formCompanyHint')}</span>
              <input id={companyId} name="company" value={profile.company} onChange={(event) => updateField('company', event.target.value)} />
            </label>
            <label className={styles.field} htmlFor={phoneId}>
              <span className={styles.fieldLabel}>{t('formPhoneLabel')}</span>
              <span className={styles.fieldHint}>{t('formPhoneHint')}</span>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={profile.phone ?? ''}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder={t('phonePlaceholder')}
              />
            </label>
            <label className={styles.field} htmlFor={cityId}>
              <span className={styles.fieldLabel}>{t('formCityLabel')}</span>
              <span className={styles.fieldHint}>{t('formCityHint')}</span>
              <input
                id={cityId}
                name="city"
                value={profile.city ?? ''}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder={t('baseCityPlaceholder')}
              />
            </label>
            {profileError ? (
              <InlineAlert tone="error" id={`${formIds}-form-error`}>
                {profileError}
              </InlineAlert>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className={styles.full}
              isLoading={pending}
              aria-describedby={profileError ? `${formIds}-form-error` : undefined}
            >
              {pending ? auth('loading') : saved ? auth('saved') : auth('saveProfile')}
            </Button>
          </form>
        </Surface>
        <Surface tone="glass" className={`${styles.guidanceCard} ${guidanceOpen ? styles.guidanceCardOpen : ''}`}>
          <button
            type="button"
            className={styles.guidanceTrigger}
            aria-expanded={guidanceOpen}
            aria-controls={PROFILE_GUIDANCE_PANEL_ID}
            onClick={() => setGuidanceOpen((open) => !open)}
          >
            <span className={styles.guidanceTriggerIcon} aria-hidden>
              <CircleHelp size={18} />
            </span>
            <span className={styles.guidanceTriggerText}>
              <span className={styles.guidanceTriggerTitle}>{t('guidanceAccordionTitle')}</span>
              <span className={styles.guidanceTriggerLead}>{t('guidanceAccordionLead')}</span>
            </span>
            <ChevronDown size={18} className={`${styles.guidanceChevron} ${guidanceOpen ? styles.guidanceChevronOpen : ''}`} aria-hidden />
          </button>
          <div
            id={PROFILE_GUIDANCE_PANEL_ID}
            className={styles.guidancePanel}
            role="region"
            aria-label={t('guidanceAccordionAria')}
            {...(!guidanceOpen ? { inert: true } : {})}
          >
            <div className={styles.guidancePanelInner}>
              <div className={styles.guidanceList}>
                <GuidanceItem icon={Shield} title={t('guidanceItemAccessTitle')} body={t('guidanceItemAccessBody')} />
                <GuidanceItem icon={Building2} title={t('guidanceItemCompanyTitle')} body={t('guidanceItemCompanyBody')} />
                <GuidanceItem icon={BellRing} title={t('guidanceItemContactTitle')} body={t('guidanceItemContactBody')} />
                <GuidanceItem icon={MapPin} title={t('guidanceItemBaseTitle')} body={t('guidanceItemBaseBody')} />
              </div>
            </div>
          </div>
        </Surface>
      </section>
      {isAvatarViewerOpen && avatarPreviewAvailable ? (
        <div className={styles.viewerOverlay} role="presentation" onClick={() => setIsAvatarViewerOpen(false)}>
          <div
            className={styles.viewerDialog}
            role="dialog"
            aria-modal="true"
            aria-label={auth('avatar')}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className={styles.viewerClose} onClick={() => setIsAvatarViewerOpen(false)} aria-label={auth('removeAvatar')}>
              ×
            </button>
            <div className={styles.viewerImageWrap}>
              <NextImage src={profile.avatarUrl ?? ''} alt="" width={640} height={640} unoptimized />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
