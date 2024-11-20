export interface CanvasCourse {
  id: number;
  sis_course_id: string | null;
  uuid: string;
  integration_id: string | null;
  sis_import_id: number;
  name: string;
  course_code: string;
  original_name: string;
  workflow_state: "unpublished" | "available" | "completed" | "deleted";
  account_id: number;
  root_account_id: number;
  enrollment_term_id: number;
  grading_periods: {
    "id": number;
    "title": string;
    "start_date": string | null;
    "end_date": string | null;
    "close_date": string | null;
    "weight": number | null;
    "is_closed": boolean;
  }[] | null;
  grading_standard_id: number;
  grade_passback_setting: string;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
  locale: string;
  enrollments: {
    "id": number;
    "course_id": number;
    "sis_course_id": string | null;
    "course_integration_id": string | null;
    "course_section_id": number | null;
    "section_integration_id": string | null;
    "sis_account_id": string | null;
    "sis_section_id": string | null;
    "sis_user_id": string | null;
    "enrollment_state": string;
    "limit_privileges_to_course_section": boolean;
    "sis_import_id": number | null;
    "root_account_id": number | null;
    "type":
        | "StudentEnrollment"
        | "TeacherEnrollment"
        | "TaEnrollment"
        | "DesignerEnrollment"
        | "ObserverEnrollment";
    "user_id": number | null;
    "associated_user_id": number | null;
    "role":
        | "StudentEnrollment"
        | "TeacherEnrollment"
        | "TaEnrollment"
        | "DesignerEnrollment"
        | "ObserverEnrollment";
    "role_id": number | null;
    "created_at": string | null;
    "updated_at": string | null;
    "start_at": string | null;
    "end_at": string | null;
    "last_activity_at": string | null;
    "last_attended_at": string | null;
    "total_activity_time": number;
    "html_url": string;
    "grades": {
      "html_url": string;
      "current_score": number | null;
      "current_grade": string | null;
      "final_score": number | null;
      "final_grade": string | null;
    };
    "user": {
      "id": number;
      "name": string;
      "sortable_name": string;
      "short_name": string;
    };
    "override_grade": string | null;
    "override_score": number | null;
    "unposted_current_grade": string | null;
    "unposted_final_grade": string | null;
    "unposted_current_score": string | null;
    "unposted_final_score": string | null;
    "has_grading_periods": boolean;
    "totals_for_all_grading_periods_option": boolean;
    "current_grading_period_title": string;
    "current_grading_period_id": number | null;
    "current_period_override_grade": string | null;
    "current_period_override_score": number | null;
    "current_period_unposted_current_score": number | null;
    "current_period_unposted_final_score": number | null;
    "current_period_unposted_current_grade": string | null;
    "current_period_unposted_final_grade": string | null;
  }[] | null;
  total_students: number | null;
  calendar: {
    ics: string;
  } | null;
  default_view: string;
  syllabus_body: string;
  needs_grading_count: number | null;
  term: {
    name: string;
  } | null;
  course_progress: object | null;
  apply_assignment_group_weights: boolean;
  permissions: {
    create_discussion_topic: boolean;
    create_announcement: true;
  };
  is_public: boolean;
  is_public_to_auth_users: boolean;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  public_description: string | null;
  storage_quota_mb: number;
  storage_quota_used_mb: number;
  hide_final_grades: boolean;
  license: string;
  allow_student_assignment_edits: boolean;
  allow_wiki_comments: boolean;
  allow_student_forum_attachments: boolean;
  open_enrollment: boolean;
  self_enrollment: boolean;
  restrict_enrollments_to_course_dates: boolean;
  course_format: string;
  access_restricted_by_date: boolean | null;
  time_zone: string;
  blueprint: boolean | null;
  blueprint_restrictions: {
    content: boolean;
    points: boolean;
    due_dates: boolean;
    availability_dates: boolean;
  } | null;
  blueprint_restrictions_by_object_type: {
    assignment: {
      content: boolean;
      points: boolean;
    },
    wiki_page: {
      content: boolean;
    }
  } | null;
  template: boolean;
}

export interface CanvasAssignment {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  description: string;
  context_code: string;
  workflow_state: string;
  url: string;
  html_url: string;
  all_day_date: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
  assignment: {
    allowed_attempts: number;
    annotatable_attachment_id: number | null;
    anonymize_students: boolean;
    anonymous_grading: boolean;
    anonymous_instructor_annotations: boolean;
    anonymous_peer_reviews: boolean;
    assignment_group_id: number;
    automatic_peer_reviews: boolean;
    can_duplicate: boolean;
    course_id: number;
    created_at: string;
    description: string;
    due_at: string | null;
    due_date_required: boolean;
    final_grader_id: number | null;
    grade_group_students_individually: boolean;
    graded_submissions_exist: boolean;
    grader_comments_visible_to_graders: boolean;
    grader_count: number;
    grader_names_visible_to_final_grader: boolean;
    graders_anonymous_to_graders: boolean;
    grading_standard_id: number | null;
    grading_type:
        | "pass_fail"
        | "percent"
        | "letter_grade"
        | "gpa_scale"
        | "points";
    group_category_id: number | null;
    has_submitted_submissions: boolean;
    hide_in_gradebook: boolean;
    html_url: string;
    id: number;
    important_dates: boolean;
    in_closed_grading_period: boolean;
    intra_group_peer_reviews: boolean;
    is_quiz_assignment: boolean;
    lock_at: string | null;
    locked_for_user: boolean;
    lti_context_id: string | null;
    max_name_length: number | null;
    moderated_grading: boolean;
    muted: boolean
    name: string;
    omit_from_final_grade: boolean;
    only_visible_to_overrides: boolean;
    original_assignment_id: number | null;
    original_assignment_name: string | null;
    original_course_id: number | null;
    original_lti_resource_link_id: number | null;
    original_quiz_id: number | null;
    peer_reviews: boolean;
    points_possible: number | null;
    position: number;
    post_manually: boolean;
    post_to_sis: boolean;
    published: boolean;
    require_lockdown_browser: boolean;
    restrict_quantitative_data: boolean;
    secure_params: string | null;
    submission_types: (
        | "discussion_topic"
        | "online_quiz"
        | "on_paper"
        | "none"
        | "external_tool"
        | "online_text_entry"
        | "online_url"
        | "online_upload"
        | "media_recording"
        | "student_annotation"
        )[] | null;
    submissions_download_url: string | null;
    unlock_at: string | null;
    updated_at: string | null;
    user_submitted: boolean;
    visible_to_everyone: boolean;
    workflow_state: "unpublished" | "published";
  } | null;
  assignment_overrides: {
    all_day: boolean;
    all_day_date: string;
    assignment_id: number;
    course_section_id: number;
    due_at: string;
    id: number;
    lock_at: string | null;
    title: string;
    unassign_item: boolean;
    unlock_at: string | null;
  }[] | null;
  important_dates: boolean;
  rrule: string;
  series_head: boolean | null;
  series_natural_language: string;
}

export interface CanvasEvent {
  courseId: number;
  events: CanvasAssignment[];
}
