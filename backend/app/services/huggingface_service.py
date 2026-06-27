import httpx
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger("gitniche.huggingface")

class HuggingFaceService:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        self.enabled = bool(settings.HUGGINGFACE_ENABLED and self.api_key)
        self.disabled_reason = None
        
        self.candidate_labels = [
            "AI/ML",
            "Blockchain",
            "Cybersecurity",
            "Web Development",
            "DevOps",
            "Cloud"
        ]

        if not self.enabled:
            logger.warning("Hugging Face remote classification is disabled. Classification fallback will use rule-based default.")

    async def classify_repository(self, name: str, description: str, topics: List[str]) -> str:
        # Prepare context to feed the model
        topics_str = ", ".join(topics)
        text_to_classify = f"Repository Name: {name}. Description: {description or ''}. Topics: {topics_str}"

        # If HF is disabled or fails, we use a basic fallback mechanism
        if not self.enabled:
            return self._heuristic_fallback(name, description, topics)

        try:
            payload = {
                "inputs": text_to_classify,
                "parameters": {
                    "candidate_labels": self.candidate_labels
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=self.headers,
                    timeout=4.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Response format: {"labels": ["Web Development", "AI/ML", ...], "scores": [0.85, 0.10, ...]}
                    labels = result.get("labels", [])
                    if labels:
                        return labels[0]
                else:
                    logger.error(f"Hugging Face API returned status {response.status_code}: {response.text}")
                    self._disable_remote(f"HTTP {response.status_code}")
                    return self._heuristic_fallback(name, description, topics)
        except Exception as e:
            logger.error(f"Error during Hugging Face zero-shot classification: {str(e)}")
            self._disable_remote(type(e).__name__)
            return self._heuristic_fallback(name, description, topics)

        return self._heuristic_fallback(name, description, topics)

    def _disable_remote(self, reason: str) -> None:
        if self.enabled:
            self.enabled = False
            self.disabled_reason = reason
            logger.warning(f"Disabling Hugging Face remote classification after failure: {reason}. Using heuristic fallback only.")

    def _heuristic_fallback(self, name: str, description: str, topics: List[str]) -> str:
        # Heuristics based on text keywords (case-insensitive)
        text = f"{name} {description or ''} {' '.join(topics)}".lower()

        if any(w in text for w in ["machine learning", "deep learning", "ai", "nlp", "computer vision", "llm", "transformer", "pytorch", "tensorflow", "neural", "keras"]):
            return "AI/ML"
        if any(w in text for w in ["blockchain", "web3", "smart contract", "solidity", "defi", "ethereum", "crypto", "solana", "nft"]):
            return "Blockchain"
        if any(w in text for w in ["security", "vulnerability", "scanner", "cryptography", "pentesting", "exploit", "cybersecurity", "cyber", "malware", "auth"]):
            return "Cybersecurity"
        if any(w in text for w in ["docker", "kubernetes", "ci/cd", "terraform", "ansible", "jenkins", "github actions", "devops", "k8s"]):
            return "DevOps"
        if any(w in text for w in ["aws", "azure", "gcp", "serverless", "cloud", "lambda", "s3", "ec2"]):
            return "Cloud"
        
        # Default to Web Development as it's the most common on GitHub
        return "Web Development"

huggingface_service = HuggingFaceService()
