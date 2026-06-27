import datetime
import math
from typing import List, Optional

class ScoringService:
    def calculate_score(
        self,
        stars: int,
        forks: int,
        open_issues: int,
        has_readme: bool,
        has_contributing: bool,
        has_license: bool,
        has_description: bool,
        last_updated_at: str,
        topics: List[str],
        repo_language: Optional[str],
        user_preferred_languages: List[str],
        has_beginner_labels: bool = False
    ) -> int:
        score = 0

        # 1. Repository Activity (25 points)
        try:
            # Parse GitHub datetime string (e.g., '2026-06-25T12:00:00Z')
            last_update = datetime.datetime.strptime(last_updated_at, "%Y-%m-%dT%H:%M:%SZ")
            now = datetime.datetime.utcnow()
            days_since_update = (now - last_update).days
            
            if days_since_update <= 7:
                score += 25
            elif days_since_update <= 14:
                score += 18
            elif days_since_update <= 30:
                score += 10
            else:
                score += 3
        except Exception:
            # Fallback if date parsing fails
            score += 12

        # 2. Beginner Friendliness (20 points)
        # Checked via issues labels (good first issue, help wanted) or beginner topics
        beginner_topics = {"beginner", "good-first-issue", "easy", "first-timers-only", "hacktoberfest", "documentation"}
        topic_match = any(t.lower() in beginner_topics for t in topics)
        
        if has_beginner_labels or topic_match:
            score += 20
        else:
            # Moderate score if it has a clean setup
            score += 5

        # 3. Tech Stack Match (20 points)
        # Check if the repo language is in user's preferences
        if not user_preferred_languages:
            # Default to full match score if user did not specify preferences
            score += 20
        elif repo_language and any(repo_language.lower() == lang.lower() for lang in user_preferred_languages):
            score += 20
        elif any(t.lower() in [l.lower() for l in user_preferred_languages] for t in topics):
            score += 15
        else:
            score += 5

        # 4. Organization Reputation / Traction (15 points)
        # Logarithmic scale for stars and forks so it's not biased only to hyper-popular repos
        reputation_val = stars + (forks * 2)
        if reputation_val > 5000:
            score += 15
        elif reputation_val > 1000:
            score += 12
        elif reputation_val > 200:
            score += 9
        elif reputation_val > 50:
            score += 6
        else:
            score += 3

        # 5. Maintainer Responsiveness (10 points)
        # If open issues count is low relative to stars, or estimation based on forks and open issues.
        # Active repositories with issues getting resolved.
        # Since we don't have full PR resolution time here, we use a proxy ratio:
        # High forks and low open issues indicates high merging/resolution rates.
        if open_issues == 0:
            score += 10
        else:
            ratio = forks / open_issues if open_issues > 0 else 1.0
            if ratio > 1.5:
                score += 10
            elif ratio > 0.5:
                score += 7
            else:
                score += 4

        # 6. Documentation Quality (10 points)
        doc_score = 0
        if has_readme:
            doc_score += 4
        if has_contributing:
            doc_score += 2
        if has_license:
            doc_score += 2
        if has_description:
            doc_score += 2
        score += doc_score

        return min(max(score, 0), 100)

scoring_service = ScoringService()
