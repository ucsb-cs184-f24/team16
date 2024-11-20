export interface GradescopeAssignment {
  name: string;
  href: string;
  released?: string;
  due?: string;
  late?: string;
}

export interface GradescopeCourse {
  shortname: string;
  name: string;
  href: string;
  assignments: GradescopeAssignment[];
}
