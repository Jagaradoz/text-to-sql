import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from src.config import settings

logger = logging.getLogger(__name__)

class LLMFactory:
    """
    Factory to instantiate the appropriate LLM provider based on request parameters.
    """
    @staticmethod
    def get_llm(provider: str, api_key: Optional[str] = None, model_name: Optional[str] = None):
        if provider.lower() == "ollama":
            model = model_name or settings.OLLAMA_MODEL
            logger.info(f"Initializing Ollama with model: {model}")
            return ChatOllama(
                model=model,
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0
            )
        
        # Default to OpenAI
        model = model_name or "gpt-4o"
        # Require the user to provide an API key
        active_key = api_key
        
        if not active_key:
            raise ValueError("OpenAI API key is missing. Please provide it in the X-AI-API-Key header.")

        logger.info(f"Initializing OpenAI with model: {model}")
        return ChatOpenAI(
            model=model,
            openai_api_key=active_key,
            temperature=0
        )
