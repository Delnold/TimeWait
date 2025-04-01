import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000'

def test_login():
    # Test login endpoint
    print("\n=== Testing POST /auth/login ===")
    login_data = {
        "username": "admin@example.com",
        "password": "admin"
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login',
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        print(f"Status Code: {response.status_code}")
        print("Response Headers:", response.headers)
        if response.status_code == 200:
            token_data = response.json()
            print("\nAccess Token:")
            print(token_data.get('access_token'))
            
            # Test an endpoint with the new token
            print("\n=== Testing GET /users/ with new token ===")
            headers = {
                'Authorization': f'Bearer {token_data["access_token"]}',
                'Accept': 'application/json'
            }
            users_response = requests.get(f'{BASE_URL}/users/', headers=headers)
            print(f"Status Code: {users_response.status_code}")
            if users_response.status_code == 200:
                print("Users Response:")
                pprint(users_response.json())
            else:
                print("Error Response:", users_response.text)
        else:
            print("Error Response:", response.text)
    except Exception as e:
        print(f"Error making request: {str(e)}")

if __name__ == '__main__':
    test_login() 