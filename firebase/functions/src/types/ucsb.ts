export interface UCSBSession {
  name: string;
  days: string[];
  start: string;
  end: string;
  location: string;
  url: string;
  instructors: string[];
}

export interface UCSBCourse {
  name: string;
  sessions: UCSBSession[];
}

export interface UCSBFinal {
  name: string;
  start: string;
  end: string;
}

export interface UCSBEvents {
  courses: UCSBCourse[];
  finals: UCSBFinal[];
}
