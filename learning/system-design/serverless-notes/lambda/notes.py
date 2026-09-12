import json
import uuid
import datetime
from dataclasses import dataclass, asdict
from typing import Dict, Any

# In a real deployment, we would use boto3 to interact with DynamoDB.
# Because AWS Lambda instances are ephemeral (stateless), any in-memory data
# will be lost when the execution environment is destroyed.
# This dict is used here purely for demonstration of the handler logic.
# In production, replace this with a DynamoDB table.
NOTES_DB: Dict[str, Any] = {}

@dataclass
class Note:
    """Represents a Note object."""
    id: str
    title: str
    body: str
    created_at: str

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function.
    
    The 'event' parameter contains data about the invoking event. When triggered
    by API Gateway, it includes HTTP method, path, headers, query parameters, and body.
    
    The 'context' parameter provides runtime information (e.g., memory limits, remaining time).
    """
    http_method = event.get('httpMethod')
    path = event.get('resource')
    
    # Simple routing
    if http_method == 'POST' and path == '/notes':
        return create_note(event)
    elif http_method == 'GET' and path == '/notes':
        return list_notes()
    elif http_method == 'GET' and path == '/notes/{id}':
        return get_note(event)
    else:
        return _build_response(404, {'message': 'Not Found'})

def create_note(event: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new note."""
    try:
        body = json.loads(event.get('body', '{}'))
        title = body.get('title')
        content = body.get('body')
        
        if not title or not content:
            return _build_response(400, {'message': 'Title and body are required'})
            
        note_id = str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        note = Note(id=note_id, title=title, body=content, created_at=created_at)
        NOTES_DB[note_id] = asdict(note)
        
        return _build_response(201, asdict(note))
    except Exception as e:
        return _build_response(500, {'message': str(e)})

def list_notes() -> Dict[str, Any]:
    """Lists all notes."""
    notes = list(NOTES_DB.values())
    return _build_response(200, notes)

def get_note(event: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieves a specific note by ID."""
    path_parameters = event.get('pathParameters', {}) or {}
    note_id = path_parameters.get('id')
    
    if not note_id:
        return _build_response(400, {'message': 'Note ID is required'})
        
    note = NOTES_DB.get(note_id)
    if note:
        return _build_response(200, note)
    else:
        return _build_response(404, {'message': 'Note not found'})

def _build_response(status_code: int, body: Any) -> Dict[str, Any]:
    """Helper to format the response for API Gateway."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' # CORS
        },
        'body': json.dumps(body)
    }
