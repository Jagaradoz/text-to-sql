import logging
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from src.config import settings

logger = logging.getLogger(__name__)

class LLMFactory:
    """
    Factory to instantiate the appropriate LLM provider based on request parameters.
    Supports OpenAI and Google Gemini.
    """
    @staticmethod
    def get_llm(provider: str, api_key: Optional[str] = None, model_name: Optional[str] = None):
        provider_lower = provider.lower()
        
        if provider_lower == "google" or provider_lower == "gemini":
            model = model_name or "gemini-1.5-flash"
            # Use provided API key or fallback to environment setting
            active_key = api_key or settings.GOOGLE_API_KEY
            
            if not active_key:
                raise ValueError("An API key is required. Please provide a valid key in the Settings page.")

            logger.info(f"Initializing Google Gemini with model: {model}")
            return ChatGoogleGenerativeAI(
                model=model,
                google_api_key=active_key,
                temperature=0
            )
        
        # Default to OpenAI
        model = model_name or "gpt-4o-mini"
        # Use provided API key or fallback to environment setting
        active_key = api_key or settings.OPENAI_API_KEY
        
        if not active_key:
            raise ValueError("An API key is required. Please provide a valid key in the Settings page.")

        logger.info(f"Initializing OpenAI with model: {model}")
        return ChatOpenAI(
            model=model,
            openai_api_key=active_key,
            temperature=0
        )
