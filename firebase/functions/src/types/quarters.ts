export interface Quarter {
  "quarter": string;
  "qyy": string;
  "name": string;
  "category": string;
  "academicYear": string;
  "firstDayOfClasses": string;
  "lastDayOfClasses": string;
  "firstDayOfFinals": string;
  "lastDayOfFinals": string;
  "firstDayOfQuarter": string;
  "lastDayOfSchedule": string;
  "pass1Begin": string;
  "pass2Begin": string;
  "pass3Begin": string;
  "feeDeadline": string;
  "lastDayToAddUnderGrad": string;
  "lastDayToAddGrad": string;
  "lastDayThirdWeek": string;
}

export interface Quarters {
  current: Quarter;
  next: Quarter;
}
