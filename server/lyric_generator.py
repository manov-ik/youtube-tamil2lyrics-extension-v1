import requests
from bs4 import BeautifulSoup
import re
import urllib.parse

def format_lyrics(text):
    # print(text)
    match = re.search(r'(Male :|Female :|Chorus :)', text)
    # Extract from the matched position to the end
    lyrics_start = text[match.start():]
    # Insert newline before each capital letter (excluding first character)
    formatted_lyrics = re.sub(r'(?<!^)(?=[A-Z])', '\n', lyrics_start)
    # print(formatted_lyrics)
    return formatted_lyrics

def get_link(query,max_results=3):
    query = "tamil2lyrics lyrics "+query
    headers = {'User-Agent': 'Mozilla/5.0'}
    query_encoded = urllib.parse.quote_plus(query)
    url = f"https://html.duckduckgo.com/html/?q={query_encoded}"

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    results = []
    for result in soup.find_all('a', {'class': 'result__a'}, limit=max_results):
        title = result.get_text()
        link = result.get('href')
        results.append({'title': title, 'link': link})

    raw_link = results[0]["link"]
    parsed = urllib.parse.urlparse("https:" + raw_link)
    query_params = urllib.parse.parse_qs(parsed.query)

    real_url = query_params.get('uddg', [None])[0]
    return real_url

# Example usage
search_query = "Madharasapattinam - Pookkal Pookkum Video"
a = get_link(search_query)
print(a)

def generate_lyrics(title, is_retry=False):
    try:
        if is_retry:
            # For retry, use the song name directly
            song_name = title.lower()
        else:
            # For normal YouTube title, extract song name
            song_name = title.split('|')[0]
            print(song_name)
        
        # Set headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Direct URL to the lyrics page
        url = get_link(query=song_name)
        print(url)
        
        # Get the page content
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the content div with id "English"
        content_div = soup.find('div', id='English')
        # print(content_div)
        
        if content_div:
            lyrics_text = content_div.get_text(strip=True)
            return format_lyrics(lyrics_text)
        else:
            return "Could not find lyrics content"
            
    except Exception as e:
        return f"Error: {str(e)}"

# if __name__ == "__main__":
#     # For testing
#     test_title = "KANIMAA Lyrical Video - RETRO | Suriya | Karthik Subbaraj | Pooja Hegde | Santhosh Narayanan"
#     print(generate_lyrics(test_title)) 