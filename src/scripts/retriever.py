from src.utils.config import settings
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.INDEX_NAME)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

def semantic_search(query: str, top_k: int = 3) -> list:
    try:
        query_embedding =  embeddings.embed_query(query)
        
        response = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        return [match['metadata'] for match in response.get('matches', [])]
    
    except Exception as e:
        print(f"Error during semantic search: {e}")
        return []