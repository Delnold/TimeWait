import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:8000'

def test_organization_roles(auth_token):
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Get organization details
        org_id = 1  # Replace with your organization ID
        print(f"\nTrying to connect to: {BASE_URL}/organizations/{org_id}")
        print(f"Headers: {headers}")
        
        response = requests.get(f'{BASE_URL}/organizations/{org_id}', headers=headers)
        
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Raw Response: {response.text}")
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return
            
        data = response.json()
        print("\n=== Organization Response ===")
        pprint(data)
        
        print("\n=== Membership Details ===")
        for member in data.get('memberships', []):
            print(f"\nUser: {member.get('user', {}).get('email')}")
            print(f"Role: {member.get('role')}")
            print(f"Role type: {type(member.get('role'))}")
            print(f"Raw member data: {member}")
            
    except requests.exceptions.ConnectionError:
        print(f"Failed to connect to {BASE_URL}. Is the server running?")
    except Exception as e:
        print(f"Error: {type(e).__name__} - {str(e)}")

if __name__ == '__main__':
    AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQzNDMxNzQzfQ.hlhZDJJW0Y_8em4oy1Cq2TXs57q1FMxJt3_KfBbQkuI'
    test_organization_roles(AUTH_TOKEN) 