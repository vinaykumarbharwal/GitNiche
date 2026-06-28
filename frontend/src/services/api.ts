export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';
const GUEST_SAVED_REPOS_KEY = 'gitniche_guest_saved_repos';


export interface AuthSession {
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export const authStorage = {
  getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    const user_id = localStorage.getItem('gitniche_user_id');
    const username = localStorage.getItem('gitniche_username');
    const email = localStorage.getItem('gitniche_email');
    const avatar_url = localStorage.getItem('gitniche_avatar_url') || undefined;
    if (!user_id || !username) return null;
    return { user_id, username, email: email || '', avatar_url };
  },
  saveSession(session: AuthSession) {
    localStorage.setItem('gitniche_user_id', session.user_id);
    localStorage.setItem('gitniche_username', session.username);
    localStorage.setItem('gitniche_email', session.email);
    if (session.avatar_url) localStorage.setItem('gitniche_avatar_url', session.avatar_url);
  },
  clearSession() {
    localStorage.removeItem('gitniche_user_id');
    localStorage.removeItem('gitniche_username');
    localStorage.removeItem('gitniche_email');
    localStorage.removeItem('gitniche_avatar_url');
  },
};
export interface RepoResult {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  domain: string;
  difficulty_level: string;
  last_activity_date: string;
  gitniche_score: number;
  github_url: string;
  codespaces_url: string;
  gitpod_url: string;
}

export interface SaveRepoPayload {
  user_id: string;
  repo_name: string;
  repo_owner: string;
  repo_url: string;
  domain: string;
  difficulty: string;
  gitniche_score: number;
}

export interface SavedRepository {
  id: string;
  user_id: string;
  repo_name: string;
  repo_owner: string;
  repo_url: string;
  domain: string;
  difficulty: string;
  gitniche_score: number;
  created_at: string;
}

function isGuestUser(userId: string): boolean {
  return userId === GUEST_USER_ID;
}

function getGuestSavedRepos(): SavedRepository[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(GUEST_SAVED_REPOS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedRepository[]) : [];
  } catch {
    return [];
  }
}

function setGuestSavedRepos(repos: SavedRepository[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_SAVED_REPOS_KEY, JSON.stringify(repos));
}

function removeGuestSavedRepo(userId: string, repoOwner: string, repoName: string) {
  const existing = getGuestSavedRepos();
  const next = existing.filter(
    (repo) => !(repo.user_id === userId && repo.repo_owner === repoOwner && repo.repo_name === repoName)
  );
  setGuestSavedRepos(next);
}

export const apiService = {
  getGitHubLoginUrl(): string {
    return `${API_BASE_URL}/api/auth/github/login`;
  },

  async searchRepositories(params: {
    query?: string;
    domain?: string;
    experience_level?: string;
    language?: string;
    user_id?: string;
  }): Promise<RepoResult[]> {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.domain && params.domain !== 'All Domains') queryParams.append('domain', params.domain);
    if (params.experience_level && params.experience_level !== 'All Levels') {
      queryParams.append('experience_level', params.experience_level);
    }
    if (params.language && params.language !== 'All Languages') queryParams.append('language', params.language);
    if (params.user_id) queryParams.append('user_id', params.user_id);

    const response = await fetch(`${API_BASE_URL}/api/search?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }
    return response.json();
  },

  async getSavedRepositories(userId: string): Promise<SavedRepository[]> {
    if (isGuestUser(userId)) {
      return getGuestSavedRepos();
    }

    const response = await fetch(`${API_BASE_URL}/api/saved-repos/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch saved repositories: ${response.statusText}`);
    }
    return response.json();
  },

  async saveRepository(payload: SaveRepoPayload): Promise<SavedRepository> {
    if (isGuestUser(payload.user_id)) {
      const existing = getGuestSavedRepos();
      const duplicate = existing.find(
        (repo) => repo.repo_owner === payload.repo_owner && repo.repo_name === payload.repo_name
      );
      if (duplicate) return duplicate;

      const savedRepo: SavedRepository = {
        id: `guest-${payload.repo_owner}-${payload.repo_name}`.toLowerCase(),
        user_id: payload.user_id,
        repo_name: payload.repo_name,
        repo_owner: payload.repo_owner,
        repo_url: payload.repo_url,
        domain: payload.domain,
        difficulty: payload.difficulty,
        gitniche_score: payload.gitniche_score,
        created_at: new Date().toISOString(),
      };

      setGuestSavedRepos([savedRepo, ...existing]);
      return savedRepo;
    }

    const response = await fetch(`${API_BASE_URL}/api/saved-repos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to save repository: ${response.statusText}`);
    }
    return response.json();
  },

  async unsaveRepository(userId: string, repoOwner: string, repoName: string): Promise<void> {
    if (isGuestUser(userId)) {
      removeGuestSavedRepo(userId, repoOwner, repoName);
      return;
    }

    const queryParams = new URLSearchParams({
      user_id: userId,
      repo_owner: repoOwner,
      repo_name: repoName,
    });
    const response = await fetch(`${API_BASE_URL}/api/saved-repos?${queryParams.toString()}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to unsave repository: ${response.statusText}`);
    }
  },
};
