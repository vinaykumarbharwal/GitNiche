import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.redis_service import redis_service
from app.services.huggingface_service import huggingface_service
from app.services.scoring_service import scoring_service

logger = logging.getLogger("gitniche.github")

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

    async def search_repositories(
        self,
        query: str,
        domain: Optional[str] = None,
        experience_level: Optional[str] = None,
        language: Optional[str] = None,
        user_preferred_languages: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        # 1. Check cache first
        cache_key = f"search:{query}:{domain}:{experience_level}:{language}"
        cached_data = await redis_service.get(cache_key)
        if cached_data:
            logger.info(f"Returning cached search results for key: {cache_key}")
            return json.loads(cached_data)

        # 2. Build GitHub Search Query
        # We enforce repository activity within the last 7 days by checking pushed date
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        q_parts = []
        if query:
            q_parts.append(query)
        else:
            # If no search query, search for popular/recent things
            q_parts.append("stars:>5")

        q_parts.append(f"pushed:>={seven_days_ago}")

        if language:
            q_parts.append(f"language:{language}")

        # Domain query additions (topics)
        domain_topics = {
            "AI/ML": ["machine-learning", "deep-learning", "ai", "llm", "pytorch", "tensorflow"],
            "Blockchain": ["blockchain", "web3", "smart-contract", "solidity", "ethereum"],
            "Cybersecurity": ["security", "vulnerability", "cryptography", "pentesting", "exploit"],
            "Web Development": ["react", "nextjs", "django", "fastapi", "nodejs"],
            "DevOps": ["docker", "kubernetes", "ci-cd", "terraform"],
            "Cloud": ["aws", "azure", "gcp", "serverless", "cloud"]
        }
        
        if domain and domain in domain_topics:
            topics_query = " OR ".join([f"topic:{t}" for t in domain_topics[domain]])
            q_parts.append(f"({topics_query})")

        # Experience level query additions
        if experience_level == "Beginner-Friendly":
            q_parts.append('(topic:good-first-issue OR topic:first-timers-only OR topic:beginner-friendly OR topic:hacktoberfest)')

        full_query = " ".join(q_parts)
        url = f"https://api.github.com/search/repositories?q={full_query}&sort=stars&order=desc&per_page=20"
        
        results = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    
                    for item in items:
                        repo_data = await self._process_repository_item(client, item, user_preferred_languages or [])
                        
                        # Apply domain filter at code level if domain is selected but not matching
                        if domain and repo_data["domain"] != domain:
                            continue
                        
                        # Apply experience level filter at code level if selected
                        if experience_level and repo_data["difficulty_level"] != experience_level:
                            continue
                            
                        results.append(repo_data)
                else:
                    logger.error(f"GitHub API search failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error during GitHub repository search: {str(e)}")

        # Save to cache if we have results
        if results:
            # Sort by GitNiche Score descending
            results.sort(key=lambda x: x["gitniche_score"], reverse=True)
            await redis_service.set(cache_key, json.dumps(results), expire_seconds=1800) # 30 min cache

        return results

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
                c_resp = await client.head(contrib_url, headers=self.headers, timeout=2.0)
                has_contributing = c_resp.status_code == 200
            except Exception:
                has_contributing = False
                
            # Cache the file checks
            await redis_service.set(repo_cache_key, json.dumps({"has_contributing": has_contributing}), expire_seconds=86400)

        # Check beginner labels by querying issue list briefly, or check beginner topics
        has_beginner_labels = any(t in ["good-first-issue", "first-timers-only", "easy", "beginner"] for t in topics)

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
            "codespaces_url": f"https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo={owner}/{name}",
            "gitpod_url": f"https://gitpod.io/#{github_url}"
        }

    async def _classify_domain(self, name: str, description: str, topics: List[str]) -> str:
        # Rule-based classification first
        text = f"{name} {description or ''} {' '.join(topics)}".lower()

        # AI/ML
        if any(w in text for w in ["machine learning", "deep learning", "ai", "nlp", "computer vision", "llm", "transformer", "pytorch", "tensorflow"]):
            return "AI/ML"
        
        # Blockchain
        if any(w in text for w in ["blockchain", "web3", "smart contract", "solidity", "defi", "ethereum", "solana"]):
            return "Blockchain"

        # Cybersecurity
        if any(w in text for w in ["security", "vulnerability", "scanner", "cryptography", "pentesting", "exploit", "malware"]):
            return "Cybersecurity"

        # Web Development
        if any(w in text for w in ["react", "nextjs", "django", "fastapi", "nodejs", "vue", "angular", "css", "html", "web dev"]):
            return "Web Development"

        # DevOps
        if any(w in text for w in ["docker", "kubernetes", "ci/cd", "terraform", "ansible", "k8s"]):
            return "DevOps"

        # Cloud
        if any(w in text for w in ["aws", "azure", "gcp", "serverless", "cloud"]):
            return "Cloud"

        # Fallback to Hugging Face
        return await huggingface_service.classify_repository(name, description, topics)

    def _determine_difficulty(self, item: Dict[str, Any], topics: List[str]) -> str:
        # Rules:
        # - Stars > 15000 and low forks or advanced topics = Advanced
        # - stars < 1000 and good first issue or beginner topic = Beginner-Friendly
        # - Everything else = Intermediate
        stars = item.get("stargazers_count", 0)
        
        beginner_keywords = {"beginner", "good-first-issue", "easy", "first-timers-only", "hacktoberfest"}
        has_beginner_topic = any(t.lower() in beginner_keywords for t in topics)
        
        if has_beginner_topic or (stars < 1500 and item.get("open_issues_count", 0) > 10):
            return "Beginner-Friendly"
        elif stars > 10000 or any(t in ["kernel", "compiler", "runtime", "database-engine", "cryptography"] for t in topics):
            return "Advanced"
        else:
            return "Intermediate"

github_service = GitHubService()
