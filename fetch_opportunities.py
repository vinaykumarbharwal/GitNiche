import urllib.request
import urllib.parse
import json
import os
import sys
import argparse
from datetime import datetime, timedelta

# Domain definitions matching backend classification
DOMAIN_TOPICS = {
    "AI/ML": ["machine-learning", "deep-learning", "ai", "llm", "pytorch", "tensorflow"],
    "Blockchain": ["blockchain", "web3", "solidity", "smart-contract", "ethereum"],
    "Cybersecurity": ["security", "vulnerability", "cryptography", "pentesting", "exploit"],
    "Web Development": ["react", "nextjs", "django", "fastapi", "nodejs", "vue"],
    "DevOps": ["docker", "kubernetes", "ci-cd", "terraform", "ansible"],
    "Cloud": ["aws", "azure", "gcp", "serverless", "cloud"]
}

# Beginner friendliness signal topics/tags
BEGINNER_TOPICS = ["good-first-issue", "first-timers-only", "beginner-friendly", "help-wanted"]

def safe_print(*args, **kwargs):
    text = " ".join(str(arg) for arg in args)
    encoding = sys.stdout.encoding or 'utf-8'
    try:
        sys.stdout.write(text + "\n")
    except UnicodeEncodeError:
        encoded = text.encode(encoding, errors='replace')
        decoded = encoded.decode(encoding)
        sys.stdout.write(decoded + "\n")

def load_github_token():
    # Attempt to load token from .env or backend/.env
    for env_path in [".env", "backend/.env", "../backend/.env"]:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.strip().startswith("GITHUB_TOKEN="):
                        return line.split("=")[1].strip()
    return os.environ.get("GITHUB_TOKEN", "")

def fetch_repos(domain, language, level, token):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "GitNiche-CLI-Finder"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        safe_print("Using GitHub Token for search.")
    else:
        safe_print("Warning: Running without token. Rate limit will be limited to 10 requests per minute.")

    # Determine activity window based on level
    if level == "Beginner-Friendly":
        activity_window = 90  # 90 days activity
        stars_filter = "stars:50..15000"
    elif level == "Intermediate":
        activity_window = 30  # 30 days activity
        stars_filter = "stars:100..40000"
    else:  # Advanced
        activity_window = 14  # 14 days activity
        stars_filter = "stars:>20000"

    since_date = (datetime.utcnow() - timedelta(days=activity_window)).strftime("%Y-%m-%d")

    # We will build multiple queries to find candidates
    queries = []
    domain_keywords = DOMAIN_TOPICS.get(domain, [domain])
    
    for kw in domain_keywords[:3]:
        base_q = f"topic:{kw} language:{language} {stars_filter} pushed:>={since_date}"
        if level == "Beginner-Friendly":
            for bt in BEGINNER_TOPICS[:2]:
                queries.append(f"{base_q} topic:{bt}")
        else:
            queries.append(base_q)

    if level == "Beginner-Friendly":
        queries.append(f"language:{language} topic:good-first-issue {stars_filter} pushed:>={since_date}")

    seen_ids = set()
    all_items = []

    for q in queries[:4]:
        safe_print(f"Searching GitHub with query: '{q}'...")
        params = urllib.parse.urlencode({
            "q": q,
            "sort": "stars",
            "order": "desc",
            "per_page": 10
        })
        
        req = urllib.request.Request(
            f"https://api.github.com/search/repositories?{params}",
            headers=headers
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode())
                items = res.get("items", [])
                for item in items:
                    repo_id = item["id"]
                    if repo_id not in seen_ids:
                        seen_ids.add(repo_id)
                        all_items.append(item)
        except Exception as e:
            safe_print(f"   Query failed: {e}")
            continue

    return all_items, headers

def check_contributing_file(owner, repo_name, headers):
    url = f"https://api.github.com/repos/{owner}/{repo_name}/contents/CONTRIBUTING.md"
    req = urllib.request.Request(url, headers=headers, method="HEAD")
    try:
        with urllib.request.urlopen(req) as response:
            return response.status == 200
    except Exception:
        return False

def calculate_score(repo, has_contributing):
    score = 40  # base score
    if repo.get("description"):
        score += 10
    if repo.get("license"):
        score += 15
    if has_contributing:
        score += 20
    open_issues = repo.get("open_issues_count", 0)
    if open_issues > 30:
        score += 10
    elif open_issues > 5:
        score += 5
    return min(score, 100)

def main():
    parser = argparse.ArgumentParser(description="Fetch real-time GitHub repositories suitable for contributions.")
    parser.add_argument("--domain", choices=list(DOMAIN_TOPICS.keys()), required=True, help="Target domain")
    parser.add_argument("--language", required=True, help="Programming language (e.g. Python, TypeScript, Rust)")
    parser.add_argument("--level", choices=["Beginner-Friendly", "Intermediate", "Advanced"], default="Beginner-Friendly", help="Difficulty level")
    
    args = parser.parse_args()
    token = load_github_token()
    
    safe_print(f"Fetching real-time repositories for:")
    safe_print(f" - Domain:   {args.domain}")
    safe_print(f" - Language: {args.language}")
    safe_print(f" - Level:    {args.level}")
    safe_print("-" * 50)
    
    repos, headers = fetch_repos(args.domain, args.language, args.level, token)
    
    if not repos:
        safe_print("\nNo matching repositories found. Try running with a valid GITHUB_TOKEN or broadening your parameters.")
        return
        
    safe_print(f"\nProcessing {len(repos)} unique repositories for contribution readiness...")
    opportunities = []
    
    for repo in repos[:5]:
        owner = repo["owner"]["login"]
        name = repo["name"]
        
        has_contrib = check_contributing_file(owner, name, headers)
        score = calculate_score(repo, has_contrib)
        
        opportunities.append({
            "name": name,
            "owner": owner,
            "stars": repo["stargazers_count"],
            "forks": repo["forks_count"],
            "open_issues": repo["open_issues_count"],
            "url": repo["html_url"],
            "description": repo["description"] or "No description provided.",
            "has_contributing": has_contrib,
            "score": score
        })
        
    # Sort by readiness score descending
    opportunities.sort(key=lambda x: x["score"], reverse=True)
    
    safe_print("\n" + "="*80)
    safe_print(f" TOP PR OPPORTUNITIES ({args.domain} | {args.language} | {args.level}) ")
    safe_print("="*80)
    
    for idx, opp in enumerate(opportunities, 1):
        safe_print(f"\n{idx}. {opp['owner']}/{opp['name']} (Score: {opp['score']}/100)")
        safe_print(f"   URL:          {opp['url']}")
        safe_print(f"   Description:  {opp['description']}")
        safe_print(f"   Stars/Forks:  {opp['stars']} stars | {opp['forks']} forks")
        safe_print(f"   Open Issues:  {opp['open_issues']}")
        safe_print(f"   Has CONTRIBUTING.md? {'Yes (+20 score)' if opp['has_contributing'] else 'No'}")
        safe_print("-" * 80)

if __name__ == "__main__":
    main()
