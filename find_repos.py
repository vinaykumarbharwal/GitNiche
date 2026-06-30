import urllib.request
import urllib.parse
import json
import os

# Load GitHub Token if available from .env
TOKEN = ""
if os.path.exists("backend/.env"):
    with open("backend/.env", "r") as f:
        for line in f:
            if line.startswith("GITHUB_TOKEN="):
                TOKEN = line.split("=")[1].strip()
elif os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GITHUB_TOKEN="):
                TOKEN = line.split("=")[1].strip()

HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "GitNiche-Finder"
}
if TOKEN:
    HEADERS["Authorization"] = f"Bearer {TOKEN}"
    print("Using GitHub Token from .env configuration.")
else:
    print("No GitHub Token found, using unauthenticated requests.")

def search_github(domain, keywords):
    # Form query with parentheses to group OR keywords properly
    query_str = " OR ".join(keywords)
    q = f"({query_str}) stars:>100"
    print(f"\nSearching GitHub for {domain} repositories with query: '{q}'...")
    params = urllib.parse.urlencode({
        "q": q,
        "sort": "stars",
        "order": "desc",
        "per_page": 20
    })
    
    req = urllib.request.Request(
        f"https://api.github.com/search/repositories?{params}",
        headers=HEADERS
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            items = res.get("items", [])
            print(f"   Success. Found {len(items)} repositories.")
            return items
    except Exception as e:
        print(f"   Error fetching from GitHub: {e}")
        return []

def main():
    blockchain_keywords = ["blockchain", "web3", "solidity", "ethereum", "solana"]
    cybersecurity_keywords = ["cybersecurity", "cryptography", "pentesting", "vulnerability"]
    
    blockchain_repos = search_github("Blockchain", blockchain_keywords)
    cybersecurity_repos = search_github("Cybersecurity", cybersecurity_keywords)
    
    results = {
        "Blockchain": [
            {
                "name": repo["name"],
                "owner": repo["owner"]["login"],
                "stars": repo["stargazers_count"],
                "forks": repo["forks_count"],
                "language": repo["language"],
                "url": repo["html_url"],
                "description": repo["description"]
            }
            for repo in blockchain_repos
        ],
        "Cybersecurity": [
            {
                "name": repo["name"],
                "owner": repo["owner"]["login"],
                "stars": repo["stargazers_count"],
                "forks": repo["forks_count"],
                "language": repo["language"],
                "url": repo["html_url"],
                "description": repo["description"]
            }
            for repo in cybersecurity_repos
        ]
    }
    
    output_file = "found_repos.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nAll done! Saved {len(results['Blockchain'])} Blockchain and {len(results['Cybersecurity'])} Cybersecurity repositories to:")
    print(f"   {os.path.abspath(output_file)}")

if __name__ == "__main__":
    main()
