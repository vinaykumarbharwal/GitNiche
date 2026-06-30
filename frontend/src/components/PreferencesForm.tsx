"use client";

import { useState, useEffect } from 'react';
import { apiService, authStorage, GitHubIdentityValidation, PreferencesPayload } from '@/services/api';

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

interface PreferencesFormProps {
  onSaveSuccess?: (userId: string, username: string) => void;
}

export default function PreferencesForm({ onSaveSuccess }: PreferencesFormProps) {
  const [hasLoadedInitialSession, setHasLoadedInitialSession] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('Beginner-Friendly');
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [identityValidation, setIdentityValidation] = useState<GitHubIdentityValidation | null>(null);

  const domains = ['AI/ML', 'Blockchain', 'Cybersecurity', 'Web Development', 'DevOps', 'Cloud'];
  const languages = ['TypeScript', 'Python', 'Rust', 'Go', 'JavaScript', 'Java', 'C++', 'Ruby'];

  useEffect(() => {
    const session = authStorage.getSession();
    if (session) {
      setUsername(session.username);
      setEmail(session.email);
      setLoading(true);
      apiService.getPreferences(session.user_id)
        .then((pref) => {
          if (!pref) return;
          setSelectedDomains(pref.domains || []);
          setSelectedLanguages(pref.languages || []);
          setExperienceLevel(pref.experience_level || 'Beginner-Friendly');
          setCareerGoal(pref.career_goal || '');
        })
        .catch((err) => console.error('Could not fetch preferences on mount', err))
        .finally(() => setLoading(false));
    }
    setHasLoadedInitialSession(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedInitialSession) return;

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setIdentityValidation(null);
      setValidationError(null);
      setValidationLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setValidationLoading(true);
      setValidationError(null);

      try {
        const result = await apiService.validateGitHubIdentity(trimmedUsername, trimmedEmail);
        setIdentityValidation(result);
      } catch (err: unknown) {
        setValidationError(getErrorMessage(err, 'Unable to verify GitHub identity right now.'));
      } finally {
        setValidationLoading(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [username, email, hasLoadedInitialSession]);

  const canSubmitIdentity = (() => {
    if (!username.trim() || !email.trim()) return false;
    if (validationLoading) return false;

    // Do not block saving when verification service is unavailable.
    if (!identityValidation) return true;

    if (!identityValidation.username_exists) return false;
    if (!identityValidation.email_format_valid) return false;

    // Email mismatch with public GitHub profile is informational only.
    return true;
  })();

  const toggleValue = (value: string, values: string[], setter: (next: string[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      setMessage({ text: 'Please provide both a GitHub username and an email.', isError: true });
      return;
    }

    if (!canSubmitIdentity) {
      setMessage({ text: 'Please provide a valid GitHub username and email format before saving.', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload: PreferencesPayload = {
      github_username: username.trim(),
      email: email.trim(),
      domains: selectedDomains,
      languages: selectedLanguages,
      experience_level: experienceLevel,
      career_goal: careerGoal.trim() || undefined,
    };

    try {
      const response = await apiService.savePreferences(payload);
      authStorage.saveSession({
        user_id: response.user.id,
        username: response.user.github_username,
        email: response.user.email,
        avatar_url: authStorage.getSession()?.avatar_url,
      });
      setMessage({ text: 'Preferences saved.', isError: false });
      onSaveSuccess?.(response.user.id, response.user.github_username);
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: getErrorMessage(err, 'Error occurred while saving preferences.'), isError: true });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] outline-none placeholder:text-[#8b949e] focus:border-[#1f6feb] focus:bg-[#0d1117] focus:ring-2 focus:ring-[#1f6feb]/30';

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl rounded-md border border-[#30363d] bg-[#161b22] shadow-sm">
      <div className="border-b border-[#30363d] px-5 py-4">
        <h2 className="text-base font-semibold text-[#f0f6fc]">Developer profile</h2>
        <p className="mt-1 text-sm text-[#8b949e]">Use your GitHub identity and preferences to tune repository scoring.</p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#f0f6fc]">GitHub username</span>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="octocat" className={fieldClass} />
            {identityValidation && (
              <span className={`text-xs ${identityValidation.username_exists ? 'text-[#7ee787]' : 'text-[#ff7b72]'}`}>
                {identityValidation.username_exists ? 'GitHub username found.' : 'GitHub username not found.'}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#f0f6fc]">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev@example.com" className={fieldClass} />
            {identityValidation && (
              <span className={`text-xs ${identityValidation.email_format_valid ? 'text-[#7ee787]' : 'text-[#ff7b72]'}`}>
                {identityValidation.email_verification_note}
              </span>
            )}
          </label>
        </div>

        {(validationLoading || validationError) && (
          <div className="-mt-2 text-xs">
            {validationLoading && <span className="text-[#8b949e]">Verifying GitHub identity...</span>}
            {!validationLoading && validationError && <span className="text-[#ff7b72]">{validationError}</span>}
          </div>
        )}

        <div className="border-t border-[#30363d] pt-5">
          <div className="mb-2 text-sm font-medium text-[#f0f6fc]">Preferred domains</div>
          <div className="flex flex-wrap gap-2">
            {domains.map((dom) => {
              const selected = selectedDomains.includes(dom);
              return <button type="button" key={dom} onClick={() => toggleValue(dom, selectedDomains, setSelectedDomains)} className={`rounded-full border px-3 py-1 text-xs font-medium ${selected ? 'border-[#58a6ff] bg-[#0c2d6b] text-[#79c0ff]' : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:bg-[#21262d]'}`}>{dom}</button>;
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-[#f0f6fc]">Preferred languages</div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => {
              const selected = selectedLanguages.includes(lang);
              return <button type="button" key={lang} onClick={() => toggleValue(lang, selectedLanguages, setSelectedLanguages)} className={`rounded-full border px-3 py-1 text-xs font-medium ${selected ? 'border-[#3fb950] bg-[#143d1f] text-[#7ee787]' : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:bg-[#21262d]'}`}>{lang}</button>;
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-[#f0f6fc]">Target difficulty</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Beginner-Friendly', 'Intermediate', 'Advanced'].map((level) => (
              <button type="button" key={level} onClick={() => setExperienceLevel(level)} className={`rounded-md border px-3 py-2 text-sm font-medium ${experienceLevel === level ? 'border-[#58a6ff] bg-[#0c2d6b] text-[#79c0ff]' : 'border-[#30363d] bg-[#0d1117] text-[#f0f6fc] hover:bg-[#21262d]'}`}>{level}</button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[#f0f6fc]">Career objectives</span>
          <textarea rows={4} value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="Find Python ML projects to build my portfolio." className={`${fieldClass} resize-none`} />
        </label>

        <div className="flex flex-col gap-3 border-t border-[#30363d] pt-5 sm:flex-row sm:items-center">
          <button type="submit" disabled={loading || !canSubmitIdentity} className="rounded-md bg-[#2da44e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2c974b] disabled:opacity-60">
            {loading ? 'Saving...' : 'Save preferences'}
          </button>
          {message && <span className={`text-sm font-medium ${message.isError ? 'text-[#ff7b72]' : 'text-[#7ee787]'}`}>{message.text}</span>}
        </div>
      </div>
    </form>
  );
}
