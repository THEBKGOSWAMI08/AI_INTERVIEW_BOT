from fastapi import FastAPI, HTTPException
from backend.models.interview_models import (
    ScheduleRequest,
    ScheduleResponse,
    StartInterviewRequest,
    StartInterviewResponse
)

from backend.services.session_manager import session_manager
from backend.websocket.interview_ws import router as websocket_router

app = FastAPI(title="AI Interview Platform Backend")

# Register the WebSocket routes
app.include_router(websocket_router)

@app.post('/api/schedule', response_model=ScheduleResponse)
def schedule_interview(request: ScheduleRequest):
    session_id = session_manager.create_session(request.user_id)
    return ScheduleResponse(session_id=session_id)

@app.post('/api/start_interview', response_model=StartInterviewResponse)
def start_interview(request: StartInterviewRequest):
    ws_url = session_manager.start_session(request.session_id)
    if not ws_url:
        raise HTTPException(status_code=404, detail="Session not found")
    return StartInterviewResponse(ws_url=ws_url)

@app.get('/question')
def get_question():
    return {'question': 'Explain overfitting vs underfitting.'}

# To run: uvicorn main:app --reload


# from fastapi import FastAPI, HTTPException

# from backend.models.interview_models import (
#     ScheduleRequest,
#     ScheduleResponse,
#     StartInterviewRequest,
#     StartInterviewResponse,
# )

# from backend.services.session_manager import session_manager
# from backend.websocket.interview_ws import router as websocket_router


# app = FastAPI(title="AI Interview Platform Backend")

# # Register WebSocket routes
# app.include_router(websocket_router)


# @app.post("/api/schedule", response_model=ScheduleResponse)
# def schedule_interview(request: ScheduleRequest):
#     session_id = session_manager.create_session(request.user_id)
#     return ScheduleResponse(session_id=session_id)


# @app.post("/api/start_interview", response_model=StartInterviewResponse)
# def start_interview(request: StartInterviewRequest):
#     ws_url = session_manager.start_session(request.session_id)

#     if not ws_url:
#         raise HTTPException(status_code=404, detail="Session not found")

#     return StartInterviewResponse(ws_url=ws_url)


# @app.get("/question")
# def get_question():
#     return {"question": "Explain overfitting vs underfitting."}