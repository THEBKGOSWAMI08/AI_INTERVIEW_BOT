from pydantic import BaseModel

class ScheduleRequest(BaseModel):
    user_id: str

class ScheduleResponse(BaseModel):
    session_id: str

class StartInterviewRequest(BaseModel):
    session_id: str

class StartInterviewResponse(BaseModel):
    ws_url: str

class InterviewSession(BaseModel):
    session_id: str
    user_id: str
    status: str = "scheduled" # scheduled, in_progress, completed
