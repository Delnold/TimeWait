import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000'
AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQzNDM1NjIyfQ.gfLrkcCod-ZBJmwDRhCnxvCyaKfB7Dwhig9nXHM4jWQ'

def test_users_api():
    headers = {
        'Authorization': f'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    print("\n=== Headers being sent ===")
    pprint(headers)
    
    # Test getting all users
    print("\n=== Testing GET /users/ ===")
    try:
        response = requests.get(f'{BASE_URL}/users/', headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:", response.headers)
        print("Response Body:")
        pprint(response.json() if response.status_code == 200 else response.text)
    except Exception as e:
        print(f"Error making request: {str(e)}")
    
    # Test search functionality
    print("\n=== Testing GET /users/?search=admin ===")
    try:
        response = requests.get(
            f'{BASE_URL}/users/',
            params={'search': 'admin'},
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        pprint(response.json() if response.status_code == 200 else response.text)
    except Exception as e:
        print(f"Error making request: {str(e)}")

if __name__ == '__main__':
    test_users_api() 