export type HealthRecordType = "Bakım" | "Ekspertiz" | "Hasar notu" | "Masraf" | "Sağlık Skoru" | "Hatırlatma";

export type HealthRecord = {
  id: string;
  type: HealthRecordType;
  title: string;
  detail: string;
  date: string;
  score?: number;
  createdAt: string;
};

export const healthRecordTypes: HealthRecordType[] = [
  "Bakım",
  "Ekspertiz",
  "Hasar notu",
  "Masraf",
  "Sağlık Skoru",
  "Hatırlatma",
];
