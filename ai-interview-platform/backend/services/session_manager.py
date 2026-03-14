import uuid
from typing import Dict
from backend.models.interview_models import InterviewSession

class SessionManager:
    def __init__(self):
        # In-memory store mapping session_id to InterviewSession
        self.sessions: Dict[str, InterviewSession] = {}

    def create_session(self, user_id: str) -> str:
        session_id = str(uuid.uuid4())
        session = InterviewSession(session_id=session_id, user_id=user_id)
        self.sessions[session_id] = session
        return session_id

    def start_session(self, session_id: str) -> str:
        if session_id in self.sessions:
            self.sessions[session_id].status = "in_progress"
            # Return a websocket URL pointing to our ws endpoint
            return f"ws://localhost:8000/ws/interview/{session_id}"
        return ""

# Global instance for in-memory session persistence
session_manager = SessionManager()
