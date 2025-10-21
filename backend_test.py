#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Nishchit PDS Application
Tests all authentication, citizen, dealer, and admin endpoints
"""

import requests
import sys
import json
from datetime import datetime

class NishchitAPITester:
    def __init__(self, base_url="https://food-security.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}  # Store tokens for different roles
        self.users = {}   # Store user data for different roles
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details if not success else "")
            
            return success, response.json() if success and response.content else {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_auth_flow(self, identifier, role_name):
        """Test complete authentication flow for a user"""
        print(f"\n🔐 Testing {role_name} Authentication Flow...")
        
        # Step 1: Send OTP
        success, response = self.run_test(
            f"{role_name} - Send OTP",
            "POST",
            "auth/login",
            200,
            data={"identifier": identifier}
        )
        
        if not success:
            return False
        
        # Step 2: Verify OTP
        success, response = self.run_test(
            f"{role_name} - Verify OTP",
            "POST",
            "auth/verify-otp",
            200,
            data={"identifier": identifier, "otp": "1234"}
        )
        
        if success and 'access_token' in response:
            self.tokens[role_name] = response['access_token']
            self.users[role_name] = response['user']
            
            # Step 3: Test /auth/me endpoint
            auth_headers = {'Authorization': f'Bearer {self.tokens[role_name]}'}
            success, _ = self.run_test(
                f"{role_name} - Get User Info",
                "GET",
                "auth/me",
                200,
                headers=auth_headers
            )
            return success
        
        return False

    def test_citizen_endpoints(self):
        """Test all citizen-specific endpoints"""
        if 'citizen' not in self.tokens:
            print("❌ Citizen token not available, skipping citizen tests")
            return
        
        print(f"\n👤 Testing Citizen Endpoints...")
        auth_headers = {'Authorization': f'Bearer {self.tokens["citizen"]}'}
        
        # Test entitlement endpoint
        self.run_test(
            "Citizen - Get Entitlement",
            "GET",
            "citizen/entitlement",
            200,
            headers=auth_headers
        )
        
        # Test status endpoint
        self.run_test(
            "Citizen - Get Status",
            "GET",
            "citizen/status",
            200,
            headers=auth_headers
        )
        
        # Test complaints endpoints
        self.run_test(
            "Citizen - Get Complaints",
            "GET",
            "citizen/complaints",
            200,
            headers=auth_headers
        )
        
        # Test create complaint
        self.run_test(
            "Citizen - Create Complaint",
            "POST",
            "citizen/complaint",
            200,
            data={
                "subject": "Test Complaint",
                "description": "This is a test complaint from automated testing"
            },
            headers=auth_headers
        )

    def test_dealer_endpoints(self):
        """Test all dealer-specific endpoints"""
        if 'dealer' not in self.tokens:
            print("❌ Dealer token not available, skipping dealer tests")
            return
        
        print(f"\n🏪 Testing Dealer Endpoints...")
        auth_headers = {'Authorization': f'Bearer {self.tokens["dealer"]}'}
        
        # Test assigned beneficiaries
        success, beneficiaries_data = self.run_test(
            "Dealer - Get Assigned Beneficiaries",
            "GET",
            "dealer/assigned-beneficiaries",
            200,
            headers=auth_headers
        )
        
        # Test dealer stats
        self.run_test(
            "Dealer - Get Stats",
            "GET",
            "dealer/stats",
            200,
            headers=auth_headers
        )
        
        # Test mark delivery (if there are pending entitlements)
        if success and beneficiaries_data.get('beneficiaries'):
            pending_beneficiaries = [b for b in beneficiaries_data['beneficiaries'] if b['status'] == 'pending']
            if pending_beneficiaries:
                test_entitlement = pending_beneficiaries[0]
                self.run_test(
                    "Dealer - Mark Delivery",
                    "POST",
                    "dealer/mark-delivery",
                    200,
                    data={
                        "entitlement_id": test_entitlement['id'],
                        "remarks": "Test delivery from automated testing"
                    },
                    headers=auth_headers
                )

    def test_admin_endpoints(self):
        """Test all admin-specific endpoints"""
        if 'admin' not in self.tokens:
            print("❌ Admin token not available, skipping admin tests")
            return
        
        print(f"\n👑 Testing Admin Endpoints...")
        auth_headers = {'Authorization': f'Bearer {self.tokens["admin"]}'}
        
        # Test analytics
        self.run_test(
            "Admin - Get Analytics",
            "GET",
            "admin/analytics",
            200,
            headers=auth_headers
        )
        
        # Test complaints
        success, complaints_data = self.run_test(
            "Admin - Get All Complaints",
            "GET",
            "admin/complaints",
            200,
            headers=auth_headers
        )
        
        # Test region stats
        self.run_test(
            "Admin - Get Region Stats",
            "GET",
            "admin/region-stats",
            200,
            headers=auth_headers
        )
        
        # Test resolve complaint (if there are open complaints)
        if success and complaints_data.get('complaints'):
            open_complaints = [c for c in complaints_data['complaints'] if c['status'] == 'open']
            if open_complaints:
                test_complaint = open_complaints[0]
                self.run_test(
                    "Admin - Resolve Complaint",
                    "POST",
                    f"admin/resolve-complaint/{test_complaint['id']}",
                    200,
                    headers=auth_headers
                )

    def test_unauthorized_access(self):
        """Test that protected endpoints reject unauthorized requests"""
        print(f"\n🔒 Testing Unauthorized Access Protection...")
        
        protected_endpoints = [
            ("citizen/entitlement", "GET"),
            ("dealer/stats", "GET"),
            ("admin/analytics", "GET")
        ]
        
        for endpoint, method in protected_endpoints:
            self.run_test(
                f"Unauthorized - {endpoint}",
                method,
                endpoint,
                401  # Should return 401 Unauthorized
            )

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Nishchit PDS Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test credentials from the application
        test_credentials = {
            "citizen": "rajesh@example.com",
            "dealer": "dealer1@example.com", 
            "admin": "admin@example.com"
        }
        
        # Test authentication for all roles
        auth_success = True
        for role, identifier in test_credentials.items():
            if not self.test_auth_flow(identifier, role):
                auth_success = False
        
        if not auth_success:
            print("\n❌ Authentication tests failed. Cannot proceed with role-specific tests.")
            return False
        
        # Test unauthorized access
        self.test_unauthorized_access()
        
        # Test role-specific endpoints
        self.test_citizen_endpoints()
        self.test_dealer_endpoints()
        self.test_admin_endpoints()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = NishchitAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            "test_details": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())