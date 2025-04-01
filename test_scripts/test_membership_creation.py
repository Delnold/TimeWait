import requests
import json
from pprint import pprint

BASE_URL = 'http://localhost:3000'

def test_create_membership(auth_token, organization_id, user_id, role):
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'user_id': user_id,
        'role': role
    }
    
    # Create membership
    response = requests.post(
        f'{BASE_URL}/organizations/{organization_id}/memberships/',
        headers=headers,
        json=data
    )
    
    print("\n=== Create Membership Response ===")
    pprint(response.json() if response.status_code == 200 else response.text)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        # Get organization to verify membership
        org_response = requests.get(
            f'{BASE_URL}/organizations/{organization_id}',
            headers=headers
        )
        
        print("\n=== Organization Memberships After Creation ===")
        org_data = org_response.json()
        for member in org_data.get('memberships', []):
            print(f"\nUser ID: {member.get('user_id')}")
            print(f"Role: {member.get('role')}")
            print(f"Role type: {type(member.get('role'))}")

if __name__ == '__main__':
    # Replace these values with your actual data
    AUTH_TOKEN = 'your_auth_token_here'
    ORGANIZATION_ID = 1
    USER_ID = 1
    ROLE = 'ADMIN'  # Try both 'ADMIN' and 'admin' to test case sensitivity
    
    test_create_membership(AUTH_TOKEN, ORGANIZATION_ID, USER_ID, ROLE) 