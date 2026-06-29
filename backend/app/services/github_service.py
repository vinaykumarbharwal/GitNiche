import httpx
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.redis_service import redis_service
from app.services.huggingface_service import huggingface_service
from app.services.scoring_service import scoring_service

logger = logging.getLogger("gitniche.github")

class GitHubSearchError(RuntimeError):
    pass

DOMAIN_TOPICS = {
    "AI/ML": ["machine-learning", "deep-learning", "ai", "llm", "pytorch", "tensorflow"],
    "Blockchain": ["blockchain", "web3", "smart-contract", "solidity", "ethereum"],
    "Cybersecurity": ["security", "vulnerability", "cryptography", "pentesting", "exploit"],
    "Web Development": ["react", "nextjs", "django", "fastapi", "nodejs"],
    "DevOps": ["docker", "kubernetes", "ci-cd", "terraform"],
    "Cloud": ["aws", "azure", "gcp", "serverless", "cloud"],
}

BEGINNER_TOPICS = ["good-first-issue", "first-timers-only", "beginner-friendly", "hacktoberfest", "help-wanted"]
BEGINNER_LEVEL = "Beginner-Friendly"
INTERMEDIATE_LEVEL = "Intermediate"
ADVANCED_LEVEL = "Advanced"
ADVANCED_TOPICS = {"kernel", "compiler", "runtime", "database-engine", "cryptography"}
BEGINNER_ISSUE_QUALIFIERS = ["good-first-issues:>0", "help-wanted-issues:>0"]

FALLBACK_REPOSITORIES = [
    {
        "name": "public-apis",
        "owner": "public-apis",
        "description": "A collective list of free APIs for use in software and web development.",
        "stars": 340000,
        "forks": 37000,
        "language": "Python",
        "domain": "Web Development",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 91,
        "github_url": "https://github.com/public-apis/public-apis",
    },
    {
        "name": "free-programming-books",
        "owner": "EbookFoundation",
        "description": "Freely available programming books and learning resources.",
        "stars": 360000,
        "forks": 63000,
        "language": None,
        "domain": "Web Development",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 89,
        "github_url": "https://github.com/EbookFoundation/free-programming-books",
    },
    {
        "name": "first-contributions",
        "owner": "firstcontributions",
        "description": "Help beginners make their first open source contribution.",
        "stars": 50000,
        "forks": 90000,
        "language": None,
        "domain": "Web Development",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 88,
        "github_url": "https://github.com/firstcontributions/first-contributions",
    },
    {
        "name": "scikit-learn",
        "owner": "scikit-learn",
        "description": "Machine learning in Python with beginner-friendly documentation and contribution labels.",
        "stars": 62000,
        "forks": 26000,
        "language": "Python",
        "domain": "AI/ML",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 87,
        "github_url": "https://github.com/scikit-learn/scikit-learn",
    },
    {
        "name": "keras",
        "owner": "keras-team",
        "description": "Deep learning for humans, built with Python and beginner-accessible examples.",
        "stars": 63000,
        "forks": 20000,
        "language": "Python",
        "domain": "AI/ML",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 86,
        "github_url": "https://github.com/keras-team/keras",
    },
    {
        "name": "fastapi",
        "owner": "fastapi",
        "description": "FastAPI framework, high performance, easy to learn, fast to code.",
        "stars": 85000,
        "forks": 7000,
        "language": "Python",
        "domain": "Web Development",
        "difficulty_level": INTERMEDIATE_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 86,
        "github_url": "https://github.com/fastapi/fastapi",
    },
    {
        "name": "awesome-machine-learning",
        "owner": "josephmisiti",
        "description": "A curated list of machine learning frameworks, libraries and software.",
        "stars": 70000,
        "forks": 15000,
        "language": "Python",
        "domain": "AI/ML",
        "difficulty_level": INTERMEDIATE_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 84,
        "github_url": "https://github.com/josephmisiti/awesome-machine-learning",
    },
    {
        "name": "cloud-resume-challenge",
        "owner": "cloudresumechallenge",
        "description": "Starter-friendly cloud projects for learning serverless and deployment workflows.",
        "stars": 9000,
        "forks": 2500,
        "language": "Python",
        "domain": "Cloud",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 85,
        "github_url": "https://github.com/cloudresumechallenge/projects",
    },
    {
        "name": "cloud-custodian",
        "owner": "cloud-custodian",
        "description": "Rules engine for cloud security, cost optimization and governance.",
        "stars": 7000,
        "forks": 1400,
        "language": "Python",
        "domain": "Cloud",
        "difficulty_level": INTERMEDIATE_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 82,
        "github_url": "https://github.com/cloud-custodian/cloud-custodian",
    },
    {
        "name": "web3.py",
        "owner": "ethereum",
        "description": "Python library for interacting with Ethereum and Web3 APIs.",
        "stars": 6000,
        "forks": 1800,
        "language": "Python",
        "domain": "Blockchain",
        "difficulty_level": INTERMEDIATE_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 81,
        "github_url": "https://github.com/ethereum/web3.py",
    },
    {
        "name": "security-list",
        "owner": "zbetcheckin",
        "description": "Beginner-friendly cybersecurity resources and curated security learning material.",
        "stars": 4000,
        "forks": 900,
        "language": "Python",
        "domain": "Cybersecurity",
        "difficulty_level": BEGINNER_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 80,
        "github_url": "https://github.com/zbetcheckin/Security_list",
    },
    {
        "name": "kubernetes",
        "owner": "kubernetes",
        "description": "Production-grade container scheduling and management.",
        "stars": 115000,
        "forks": 40000,
        "language": "Go",
        "domain": "DevOps",
        "difficulty_level": ADVANCED_LEVEL,
        "last_activity_date": "2026-06-01T00:00:00Z",
        "gitniche_score": 82,
        "github_url": "https://github.com/kubernetes/kubernetes",
    },
]

class GitHubService:
    def __init__(self):
        self.token = settings.GITHUB_TOKEN
        self.headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "GitNiche-MVP"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"
            logger.info("GitHub API configured with token authentication.")
        else:
            logger.warning("GitHub API configured without token. API rate limit will be constrained.")

    async def validate_user_identity(self, username: str, email: str) -> Dict[str, Any]:
        normalized_username = (username or "").strip()
        normalized_email = (email or "").strip().lower()

        email_format_valid = bool(normalized_email) and ("@" in normalized_email and "." in normalized_email.split("@")[-1])
        default_result = {
            "username_exists": False,
            "email_format_valid": email_format_valid,
            "email_matches_public_profile": None,
            "email_verification_note": "Unable to validate against GitHub right now.",
            "profile_url": None,
        }

        if not normalized_username:
            default_result["email_verification_note"] = "Enter a GitHub username to validate."
            return default_result

        try:
            async with httpx.AsyncClient(timeout=8) as client:
                response = await client.get(
                    f"https://api.github.com/users/{normalized_username}",
                    headers=self.headers,
                )
        except Exception as e:
            logger.warning(f"GitHub identity validation request failed for {normalized_username}: {str(e)}")
            return default_result

        if response.status_code == 404:
            default_result["email_verification_note"] = "GitHub username was not found."
            return default_result

        if response.status_code != 200:
            default_result["email_verification_note"] = "GitHub verification is temporarily unavailable."
            return default_result

        profile = response.json()
        public_email = (profile.get("email") or "").strip().lower()

        email_matches_public_profile: bool | None = None
        note = "GitHub account found."

        if not email_format_valid:
            note = "GitHub account found, but email format is invalid."
        elif public_email:
            email_matches_public_profile = public_email == normalized_email
            note = (
                "Email matches the public GitHub email."
                if email_matches_public_profile
                else "Email does not match the public GitHub email."
            )
        else:
            note = "GitHub account found. Email cannot be fully verified because the profile email is private."

        return {
            "username_exists": True,
            "email_format_valid": email_format_valid,
            "email_matches_public_profile": email_matches_public_profile,
            "email_verification_note": note,
            "profile_url": profile.get("html_url"),
        }

    async def search_repositories(
        self,
        query: str,
        domain: Optional[str] = None,
        experience_level: Optional[str] = None,
        language: Optional[str] = None,
        user_preferred_languages: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        # 1. Check cache first
        cache_key = f"search:v13:{query}:{domain}:{experience_level}:{language}"
        cached_data = await redis_service.get(cache_key)
        if cached_data:
            logger.info(f"Returning cached search results for key: {cache_key}")
            return json.loads(cached_data)

        # 2. Build GitHub Search Query
        # Beginner-friendly repos often have open starter issues but do not push every week.
        activity_window_days = 90
        pushed_after = (datetime.now(timezone.utc) - timedelta(days=activity_window_days)).strftime("%Y-%m-%d")
        
        base_q_parts = []
        if query:
            base_q_parts.append(query)
        else:
            # If no search query, search for popular/recent things
            base_q_parts.append("stars:>5")

        base_q_parts.append(f"pushed:>={pushed_after}")

        if language:
            base_q_parts.append(f"language:{language}")
        
        results = []
        try:
            limits = httpx.Limits(max_connections=500, max_keepalive_connections=100)
            async with httpx.AsyncClient(limits=limits) as client:
                items = await self._fetch_search_candidates(client, base_q_parts, domain, experience_level)

                # Process top candidates concurrently with controlled concurrency to prevent memory spikes on small instances
                import asyncio
                limit = 60 if (not domain or domain == "All Domains") else 30
                unique_items = items[:limit]
                
                sem = asyncio.Semaphore(15)
                async def sem_process(item):
                    async with sem:
                        return await self._process_repository_item(client, item, user_preferred_languages or [])

                tasks = [sem_process(item) for item in unique_items]
                processed_items = await asyncio.gather(*tasks, return_exceptions=True)

                for repo_data in processed_items:
                    if isinstance(repo_data, Exception) or not repo_data:
                        continue

                    if domain:
                        repo_data["domain"] = domain

                    # Keep the final result set aligned with the sidebar selections.
                    if domain and repo_data["domain"] != domain:
                        continue

                    if experience_level and repo_data["difficulty_level"] != experience_level:
                        continue

                    results.append(repo_data)
        except GitHubSearchError as e:
            logger.error(f"GitHub repository search unavailable, returning fallback results: {str(e)}")
            results = self._fallback_results(query, domain, experience_level, language)
        except Exception as e:
            logger.exception(f"Unexpected error during GitHub repository search, returning fallback results: {str(e)}")
            results = self._fallback_results(query, domain, experience_level, language)

        if not results and (domain or experience_level):
            results = self._fallback_results(query, domain, experience_level, language)

        # Save to cache if we have results
        if results:
            results.sort(
                key=lambda x: self._rank_repository_result(x, experience_level),
                reverse=True
            )
            await redis_service.set(cache_key, json.dumps(results), expire_seconds=1800) # 30 min cache

        return results

    def _fallback_results(
        self,
        query: str,
        domain: Optional[str],
        experience_level: Optional[str],
        language: Optional[str],
    ) -> List[Dict[str, Any]]:
        normalized_query = query.strip().lower()
        filtered = self._filter_fallback_results(normalized_query, domain, experience_level, language)

        if not filtered and normalized_query and (domain or experience_level):
            filtered = self._filter_fallback_results("", domain, experience_level, language)

        return filtered

    def _filter_fallback_results(
        self,
        normalized_query: str,
        domain: Optional[str],
        experience_level: Optional[str],
        language: Optional[str],
    ) -> List[Dict[str, Any]]:
        filtered = []

        for repo in FALLBACK_REPOSITORIES:
            if domain and repo["domain"] != domain:
                continue
            if experience_level and repo["difficulty_level"] != experience_level:
                continue
            if language and repo["language"] != language:
                continue
            if normalized_query:
                haystack = self._fallback_search_text(repo)
                if normalized_query not in haystack:
                    continue

            repo_copy = dict(repo)
            repo_copy["codespaces_url"] = self._codespaces_url(repo_copy["owner"], repo_copy["name"])
            repo_copy["gitpod_url"] = f"https://gitpod.io/#{repo_copy['github_url']}"
            filtered.append(repo_copy)

        return filtered

    def _fallback_search_text(self, repo: Dict[str, Any]) -> str:
        domain_aliases = {
            "AI/ML": "ai ml artificial intelligence machine learning deep learning data science",
            "Web Development": "web frontend backend api react nextjs fastapi",
            "DevOps": "devops docker kubernetes ci cd cloud infrastructure",
            "Cloud": "cloud aws azure gcp serverless",
            "Cybersecurity": "security cybersecurity vulnerability pentesting cryptography",
            "Blockchain": "blockchain web3 ethereum solidity smart contract",
        }
        return (
            f"{repo['owner']} {repo['name']} {repo.get('description') or ''} "
            f"{repo.get('language') or ''} {repo['domain']} {domain_aliases.get(repo['domain'], '')}"
        ).lower()

    def _codespaces_url(self, owner: str, name: str) -> str:
        return f"https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo={owner}/{name}"

    def _rank_repository_result(self, repo: Dict[str, Any], experience_level: Optional[str]) -> int:
        score = repo["gitniche_score"]

        if experience_level is None:
            if repo["difficulty_level"] == BEGINNER_LEVEL:
                score += 20
            elif repo["difficulty_level"] == INTERMEDIATE_LEVEL:
                score += 12

        return score

    async def _fetch_search_candidates(
        self,
        client: httpx.AsyncClient,
        base_q_parts: List[str],
        domain: Optional[str],
        experience_level: Optional[str],
    ) -> List[Dict[str, Any]]:
        topic_groups: List[List[str]] = []

        if domain and domain in DOMAIN_TOPICS:
            topic_groups.append(DOMAIN_TOPICS[domain])
        elif not domain or domain == "All Domains":
            # Compile top topics from all domains to fetch relevant repos for All Domains
            all_topics = []
            for dom in DOMAIN_TOPICS:
                all_topics.append(DOMAIN_TOPICS[dom][0])
            topic_groups.append(all_topics)

        search_queries = self._build_topic_search_queries(base_q_parts, topic_groups)

        if experience_level in {None, BEGINNER_LEVEL}:
            search_queries.extend(
                " ".join(base_q_parts + [f"topic:{topic}"])
                for topic in BEGINNER_TOPICS
            )
            search_queries.extend(
                " ".join(base_q_parts + [qualifier])
                for qualifier in BEGINNER_ISSUE_QUALIFIERS
            )

        if experience_level is None:
            search_queries.append(" ".join(base_q_parts + ["stars:100..50000"]))
        elif experience_level == INTERMEDIATE_LEVEL:
            search_queries.append(" ".join(base_q_parts + ["stars:100..50000"]))
        elif experience_level == ADVANCED_LEVEL:
            search_queries.extend(
                " ".join(base_q_parts + [f"topic:{topic}"])
                for topic in ADVANCED_TOPICS
            )
            search_queries.append(" ".join(base_q_parts + ["stars:>50000"]))

        seen_repo_ids = set()
        candidates_by_id = {}
        candidates = []

        request_errors = []

        import asyncio

        async def fetch_query_candidates(search_query):
            is_beginner_query = any(token in search_query for token in BEGINNER_TOPICS + BEGINNER_ISSUE_QUALIFIERS)
            try:
                response = await client.get(
                    "https://api.github.com/search/repositories",
                    params={
                        "q": search_query,
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 100,
                    },
                    headers=self.headers,
                    timeout=5.0,
                )
                if response.status_code == 200:
                    return response.json().get("items", []), is_beginner_query
                else:
                    request_errors.append(f"{search_query}: HTTP {response.status_code}")
            except Exception as e:
                request_errors.append(f"{search_query}: {type(e).__name__}: {e}")
            return [], is_beginner_query

        # Query concurrently (limit to top 6 queries to prevent hitting API rate limits)
        tasks = [fetch_query_candidates(q) for q in search_queries[:6]]
        query_results = await asyncio.gather(*tasks)

        for items, is_beginner_query in query_results:
            for item in items:
                repo_id = item.get("id") or item.get("full_name")
                if repo_id in seen_repo_ids:
                    if is_beginner_query and repo_id in candidates_by_id:
                        candidates_by_id[repo_id]["_gitniche_beginner_candidate"] = True
                    continue
                seen_repo_ids.add(repo_id)
                if is_beginner_query:
                    item["_gitniche_beginner_candidate"] = True
                candidates_by_id[repo_id] = item
                candidates.append(item)

        if not candidates and request_errors:
            raise GitHubSearchError("; ".join(request_errors[:3]))

        return candidates

    def _build_topic_search_queries(self, base_q_parts: List[str], topic_groups: List[List[str]]) -> List[str]:
        if not topic_groups:
            return [" ".join(base_q_parts)]

        queries = []

        def append_queries(group_index: int, selected_topics: List[str]) -> None:
            if group_index == len(topic_groups):
                topic_parts = [f"topic:{topic}" for topic in selected_topics]
                queries.append(" ".join(base_q_parts + topic_parts))
                return

            for topic in topic_groups[group_index]:
                append_queries(group_index + 1, selected_topics + [topic])

        append_queries(0, [])
        return queries

    async def _process_repository_item(self, client: httpx.AsyncClient, item: Dict[str, Any], user_preferred_languages: List[str]) -> Dict[str, Any]:
        owner = item["owner"]["login"]
        name = item["name"]
        topics = item.get("topics", [])
        description = item.get("description", "")
        language = item.get("language")

        # Let's perform classification
        domain = await self._classify_domain(name, description, topics)
        
        # Determine difficulty level based on topics & open issues
        difficulty = self._determine_difficulty(item, topics)
        
        # Check files existence (Readme, license, contributing)
        # To avoid rate limits, we check the fields returned by GitHub or perform cached quick queries.
        # GitHub search items return 'license' field.
        has_license = item.get("license") is not None
        has_description = bool(description)
        
        # Standard repos have readme
        has_readme = True 
        
        # CONTRIBUTING.md detection - to avoid hitting rate limit we check if contributing is a topic or we check cache.
        # Let's check cached repo metadata to see if we already checked CONTRIBUTING.md.
        repo_cache_key = f"repo:meta:{owner}:{name}"
        cached_meta_str = await redis_service.get(repo_cache_key)
        
        has_contributing = False
        if cached_meta_str:
            has_contributing = json.loads(cached_meta_str).get("has_contributing", False)
        else:
            # Let's do a lightweight request to check if CONTRIBUTING.md exists
            # We will handle exceptions and default to False to protect performance.
            try:
                contrib_url = f"https://api.github.com/repos/{owner}/{name}/contents/CONTRIBUTING.md"
                c_resp = await client.head(contrib_url, headers=self.headers, timeout=4.0)
                has_contributing = c_resp.status_code == 200
            except Exception:
                has_contributing = False
                
            # Cache the file checks
            await redis_service.set(repo_cache_key, json.dumps({"has_contributing": has_contributing}), expire_seconds=86400)

        # Check beginner labels by querying issue list briefly, or check beginner topics
        has_beginner_labels = self._has_beginner_signal(item, topics)

        # Calculate Score
        score = scoring_service.calculate_score(
            stars=item.get("stargazers_count", 0),
            forks=item.get("forks_count", 0),
            open_issues=item.get("open_issues_count", 0),
            has_readme=has_readme,
            has_contributing=has_contributing,
            has_license=has_license,
            has_description=has_description,
            last_updated_at=item.get("pushed_at", ""),
            topics=topics,
            repo_language=language,
            user_preferred_languages=user_preferred_languages,
            has_beginner_labels=has_beginner_labels
        )

        github_url = item.get("html_url", f"https://github.com/{owner}/{name}")

        return {
            "name": name,
            "owner": owner,
            "description": description,
            "stars": item.get("stargazers_count", 0),
            "forks": item.get("forks_count", 0),
            "language": language,
            "domain": domain,
            "difficulty_level": difficulty,
            "last_activity_date": item.get("pushed_at", ""),
            "gitniche_score": score,
            "github_url": github_url,
            "codespaces_url": self._codespaces_url(owner, name),
            "gitpod_url": f"https://gitpod.io/#{github_url}"
        }

    async def _classify_domain(self, name: str, description: str, topics: List[str]) -> str:
        # Rule-based classification first
        text = f"{name} {description or ''} {' '.join(topics)}".lower()
        normalized_text = text.replace("-", " ").replace("_", " ")

        # AI/ML
        if any(w in normalized_text for w in ["machine learning", "deep learning", "ai", "nlp", "computer vision", "llm", "transformer", "pytorch", "tensorflow"]):
            return "AI/ML"
        
        # Blockchain
        if any(w in normalized_text for w in ["blockchain", "web3", "smart contract", "solidity", "defi", "ethereum", "solana"]):
            return "Blockchain"

        # Cybersecurity
        if any(w in normalized_text for w in ["security", "vulnerability", "scanner", "cryptography", "pentesting", "exploit", "malware"]):
            return "Cybersecurity"

        # Web Development
        if any(w in normalized_text for w in ["react", "nextjs", "django", "fastapi", "nodejs", "vue", "angular", "css", "html", "web dev"]):
            return "Web Development"

        # DevOps
        if any(w in normalized_text for w in ["docker", "kubernetes", "ci/cd", "ci cd", "terraform", "ansible", "k8s"]):
            return "DevOps"

        # Cloud
        if any(w in normalized_text for w in ["aws", "azure", "gcp", "serverless", "cloud"]):
            return "Cloud"

        # Fallback to Hugging Face
        return await huggingface_service.classify_repository(name, description, topics)

    def _determine_difficulty(self, item: Dict[str, Any], topics: List[str]) -> str:
        stars = item.get("stargazers_count", 0)
        open_issues = item.get("open_issues_count", 0)
        
        normalized_topics = {t.lower() for t in topics}
        has_advanced_topic = bool(normalized_topics.intersection(ADVANCED_TOPICS))
        
        if self._has_beginner_signal(item, topics) or (stars <= 5000 and open_issues > 0 and not has_advanced_topic):
            return BEGINNER_LEVEL
        elif has_advanced_topic or stars > 50000:
            return ADVANCED_LEVEL
        else:
            return INTERMEDIATE_LEVEL

    def _has_beginner_signal(self, item: Dict[str, Any], topics: List[str]) -> bool:
        beginner_keywords = {
            "beginner",
            "beginner-friendly",
            "good-first-issue",
            "good first issue",
            "easy",
            "first-timers-only",
            "first timers only",
            "hacktoberfest",
            "help-wanted",
            "help wanted",
            "documentation",
        }
        normalized_topics = {t.lower().replace("-", " ") for t in topics}
        text = f"{item.get('name', '')} {item.get('description') or ''}".lower().replace("-", " ")

        return bool(item.get("_gitniche_beginner_candidate")) or bool(normalized_topics.intersection(beginner_keywords)) or any(
            keyword in text for keyword in beginner_keywords
        )

github_service = GitHubService()
