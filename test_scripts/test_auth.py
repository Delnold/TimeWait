import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000'
AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQzNDMxNzQzfQ.hlhZDJJW0Y_8em4oy1Cq2TXs57q1FMxJt3_KfBbQkuI'

def test_endpoints():
    headers = {
        'Authorization': f'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    endpoints = [
        '/organizations/',
        '/users/',
        '/organizations/1',
        '/users/1'
    ]
    
    for endpoint in endpoints:
        print(f"\n=== Testing GET {endpoint} ===")
        try:
            response = requests.get(f'{BASE_URL}{endpoint}', headers=headers)
            print(f"Status Code: {response.status_code}")
            print("Response Headers:", response.headers)
            if response.status_code == 200:
                print("Response Body:")
                pprint(response.json())
            else:
                print("Error Response:", response.text)
        except Exception as e:
            print(f"Error making request: {str(e)}")

if __name__ == '__main__':
    test_endpoints() 