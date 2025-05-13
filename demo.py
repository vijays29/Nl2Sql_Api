import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()

print(os.getenv("API_KEY"))
genai.configure(api_key=os.getenv("API_KEY"))

model = genai.GenerativeModel('gemini-1.5-pro')
response = model.generate_content("Say Hello")

print(response.text)