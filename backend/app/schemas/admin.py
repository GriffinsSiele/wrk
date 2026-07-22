from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StatsResponse(BaseModel):
    total_users: int
    total_learners: int
    total_coaches: int
    total_admins: int
    total_courses: int
    total_active_projects: int
    total_leads: int
    total_certificates: int

class UserAdminResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    class Config:
        from_attributes = True

class RoleUpdate(BaseModel):
    role: str


class SeriesPoint(BaseModel):
    label: str
    value: int


class TalentMixSegment(BaseModel):
    label: str
    value: int
    color_key: str


class DispatchTrack(BaseModel):
    track: str
    active: int
    completion: int
    risk: str


class CoachSnapshot(BaseModel):
    name: str
    emirate: Optional[str] = None
    specialty: Optional[str] = None
    level: Optional[str] = None
    available: bool = False
    placement: bool = False


class AdminDashboardResponse(BaseModel):
    stats: StatsResponse
    cert_rate: int
    pool_health: int
    governance_score: int
    kpi_changes: dict
    throughput: List[SeriesPoint]
    talent_mix: List[TalentMixSegment]
    dispatch: List[DispatchTrack]
    recent_coaches: List[CoachSnapshot]
    spark_coaches: List[int]
    spark_learners: List[int]
    spark_projects: List[int]
    spark_certs: List[int]


class LearnerCourseSummary(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    progress: int
    lessons_completed: int
    lessons_total: int
    status: str
    next_module: Optional[str] = None


class LearnerDashboardResponse(BaseModel):
    first_name: str
    course_title: Optional[str] = None
    course_id: Optional[int] = None
    course_progress: int
    lessons_completed: int
    lessons_total: int
    readiness: int  # course progress alias for donut (honest progress %)
    gate_progress: int
    gate_step: int
    weekly_learning: List[SeriesPoint]
    focus_mix: List[TalentMixSegment]
    assessment_avg: Optional[int] = None
    assessment_best: Optional[int] = None
    next_module: Optional[str] = None
    has_exam_booking: bool = False
    has_practical_pass: bool = False
    has_certificate: bool = False
    written_passed: bool = False
    courses: List[LearnerCourseSummary] = []


class CoachDashboardResponse(BaseModel):
    first_name: str
    utilisation: int
    placement_score: int
    placement_eligible: bool
    nps: Optional[float] = None  # null until ratings exist
    certification_level: Optional[str] = None
    cec_credits: int = 0
    cec_status: Optional[str] = None
    pending_count: int = 0
    active_count: int = 0
    accepted_count: int = 0
    completed_count: int = 0
    declined_count: int = 0
    active_assignments: List[dict] = []
    active_assignment: Optional[dict] = None  # first active item (compat)
    throughput: List[SeriesPoint]
    delivery_mix: List[TalentMixSegment]
    nps_spark: List[float] = []
    placement_spark: List[int] = []
    throughput_values: List[int] = []  # raw values for area chart
