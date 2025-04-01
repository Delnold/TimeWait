import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000'

def test_register():
    # Test register endpoint
    print("\n=== Testing POST /auth/register ===")
    register_data = {
        "name": "Test User",
        "email": "test2@example.com",
        "password": "testpass123",
        "phone_number": "+1234567890"
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/auth/register',
            json=register_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print("Response Headers:", response.headers)
        print("Response Body:")
        pprint(response.json() if response.status_code == 200 else response.text)
        
        if response.status_code == 200:
            # Try to login with the new user
            print("\n=== Testing POST /auth/login with new user ===")
            login_data = {
                "username": register_data["email"],
                "password": register_data["password"]
            }
            login_response = requests.post(
                f'{BASE_URL}/auth/login',
                data=login_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            print(f"Login Status Code: {login_response.status_code}")
            print("Login Response:")
            pprint(login_response.json() if login_response.status_code == 200 else login_response.text)
            
            if login_response.status_code == 200:
                token = login_response.json()['access_token']
                # Test getting users with new token
                print("\n=== Testing GET /users/ with new token ===")
                users_response = requests.get(
                    f'{BASE_URL}/users/',
                    headers={
                        'Authorization': f'Bearer {token}',
                        'Accept': 'application/json'
                    }
                )
                print(f"Users Status Code: {users_response.status_code}")
                print("Users Response:")
                pprint(users_response.json() if users_response.status_code == 200 else users_response.text)
    except Exception as e:
        print(f"Error making request: {str(e)}")

if __name__ == '__main__':
    test_register() 