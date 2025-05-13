from src.rag_sys.retriever import semantic_search
def clean_text(text: str) -> str:
    cleaned = text.strip()
    cleaned = cleaned.replace('\\n', '\n').replace('\n\n', '\n')
    lines = cleaned.splitlines()
    
    formatted_lines = [
        f"  {line}" if line.startswith('-') else line.strip() for line in lines
    ]
    
    return '\n'.join(formatted_lines)

def process_search(query: str):
    search_results = semantic_search(query)
    for item in search_results:
        text = item.get('text')
        if text:
            cleaned_output = clean_text(text)
            print(cleaned_output)

if __name__ == "__main__":
    query = "i want all data from CARD_SLOT_HIERARCHY_REPRT"
    process_search(query)