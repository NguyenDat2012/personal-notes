export interface User {
  _id: string;
  username: string;
  email?: string; //user cũ chưa liên kết Google có thể chưa có email
  displayName: string;
  createdAt?: string;
  updatedAt?: string;
}
