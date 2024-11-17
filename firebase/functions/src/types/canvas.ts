export interface CanvasCourse {
  id: number;
  sis_course_id: number | null;
  uuid: string;
  integration_id: number | null;
  sis_import_id: number;
  name: string;
  course_code: string;
  original_name: string;
  workflow_state: "unpublished" | "available" | "completed" | "deleted";
  account_id: number;
  root_account_id: number;
  enrollment_term_id: number;
  grading_periods: object[] | null;
  grading_standard_id: number;
  grade_passback_setting: string;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
  locale: string;
  enrollments: object | null;
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
  assignment: object | null;
  assignment_overrides: object[] | null;
  important_dates: boolean;
  rrule: string;
  series_head: boolean | null;
  series_natural_language: string;
}

export interface CanvasEvent {
  courseId: number;
  events: CanvasAssignment[];
}
