import json
import unittest
import sys
import os

# Add lambda directory to path for importing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'lambda')))

from notes import lambda_handler, NOTES_DB

class TestNotesHandler(unittest.TestCase):
    
    def setUp(self):
        # Clear the in-memory DB before each test
        NOTES_DB.clear()
        
    def test_create_note(self):
        event = {
            'httpMethod': 'POST',
            'resource': '/notes',
            'body': json.dumps({
                'title': 'Test Note',
                'body': 'This is a test note.'
            })
        }
        
        response = lambda_handler(event, None)
        
        self.assertEqual(response['statusCode'], 201)
        body = json.loads(response['body'])
        self.assertIn('id', body)
        self.assertEqual(body['title'], 'Test Note')
        self.assertEqual(body['body'], 'This is a test note.')
        self.assertIn('created_at', body)
        
        # Verify it was added to DB
        self.assertEqual(len(NOTES_DB), 1)
        
    def test_list_notes(self):
        # Add a note manually
        NOTES_DB['123'] = {
            'id': '123',
            'title': 'Note 1',
            'body': 'Body 1',
            'created_at': '2023-01-01T12:00:00Z'
        }
        
        event = {
            'httpMethod': 'GET',
            'resource': '/notes'
        }
        
        response = lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertEqual(len(body), 1)
        self.assertEqual(body[0]['id'], '123')
        
    def test_get_note_by_id(self):
        # Add a note manually
        NOTES_DB['123'] = {
            'id': '123',
            'title': 'Note 1',
            'body': 'Body 1',
            'created_at': '2023-01-01T12:00:00Z'
        }
        
        event = {
            'httpMethod': 'GET',
            'resource': '/notes/{id}',
            'pathParameters': {
                'id': '123'
            }
        }
        
        response = lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertEqual(body['id'], '123')
        self.assertEqual(body['title'], 'Note 1')
        
    def test_get_note_not_found(self):
        event = {
            'httpMethod': 'GET',
            'resource': '/notes/{id}',
            'pathParameters': {
                'id': '999'
            }
        }
        
        response = lambda_handler(event, None)
        self.assertEqual(response['statusCode'], 404)
        body = json.loads(response['body'])
        self.assertEqual(body['message'], 'Note not found')

if __name__ == '__main__':
    unittest.main()
