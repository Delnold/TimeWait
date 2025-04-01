from enum import Enum
import json
from pprint import pprint

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    BUSINESS_OWNER = "BUSINESS_OWNER"
    USER = "USER"

def test_role_serialization():
    # Test direct enum values
    admin_role = UserRole.ADMIN
    print("\n=== Direct Enum Values ===")
    print(f"Admin role value: {admin_role}")
    print(f"Admin role type: {type(admin_role)}")
    print(f"Admin role as string: {str(admin_role)}")
    
    # Test JSON serialization
    test_data = {
        'role': admin_role
    }
    
    print("\n=== JSON Serialization ===")
    json_str = json.dumps(test_data, default=str)
    print(f"Serialized: {json_str}")
    
    # Test comparison
    print("\n=== Comparison Tests ===")
    print(f"Direct comparison (ADMIN): {admin_role == 'ADMIN'}")
    print(f"Direct comparison (admin): {admin_role == 'admin'}")
    print(f"Uppercase comparison: {str(admin_role).upper() == 'ADMIN'}")
    print(f"Lowercase comparison: {str(admin_role).lower() == 'admin'}")

if __name__ == '__main__':
    test_role_serialization() 