import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.services.session_manager import session_manager


router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps session_id to active WebSocket connection
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_personal_message(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            await websocket.send_text(json.dumps(message))

ws_manager = ConnectionManager()

@router.websocket("/ws/interview/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str):
    # Check if session exists (was started via /api/start_interview)
    if session_id not in session_manager.sessions:
        await websocket.close(code=1008) # Policy violation (invalid session)
        return

    await ws_manager.connect(websocket, session_id)
    
    # Send a mock first question upon connection as per Phase 2 requirements
    initial_question = {
        "type": "question",
        "id": "q1",
        "text": "Can you explain the difference between a list and a tuple in Python?",
        "mode": "text"
    }
    await ws_manager.send_personal_message(initial_question, session_id)

    try:
        while True:
            # Wait for incoming messages from the frontend / rPPG client
            data = await websocket.receive_text()
            payload = json.loads(data)

            # Handle the incoming message based on its type
            if payload.get("type") == "rppg_frame":
                # Mock processing: In reality, we'd calculate BPM here or pass to another service
                print(f"[{session_id}] Received rPPG frame data...")
                
                # Immediately send back a mock status payload (simulating real-time BPM feedback)
                mock_status = {
                    "type": "status",
                    "bpm": 82.5,
                    "stress_level": "moderate",
                    "confidence": 0.85
                }
                await ws_manager.send_personal_message(mock_status, session_id)
            
            elif payload.get("type") == "submit_answer":
                # Mock evaluation: receive the answer and send back a mock score
                print(f"[{session_id}] Received answer to question: {payload.get('question_id')}")
                
                mock_eval = {
                    "type": "eval_result",
                    "question_id": payload.get("question_id"),
                    "score": 85,
                    "feedback": "Great explanation! You accurately pointed out mutability."
                }
                await ws_manager.send_personal_message(mock_eval, session_id)

    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)
        print(f"Interview session {session_id} disconnected.")
