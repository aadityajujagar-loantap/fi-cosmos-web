export type Step = "home" | "menu" | "add-task" | "help-support" | "about" | "location-map" | "my-tasks" | "profile" | "personal-info" | "notifications" | "privacy-security" | "offline-data" | "employee-info" | "work-settings" | "history" | "task-details" | "task-in-progress" | "update-checklist" | "capture-photo" | "capture-docs" | "customer-signature";

export type Tone = "blue" | "orange" | "green" | "red" | "purple" | "cyan";

export interface SummaryCard {
  count: number;
  icon: "clipboard" | "hourglass" | "check" | "alert";
  label: string;
  tone: Tone;
}

export interface Task {
  action: "filled" | "outline";
  distance: string;
  icon: "search" | "document" | "id" | "scale" | "folder";
  location: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  time: string;
  title: string;
  tone: Tone;
}
