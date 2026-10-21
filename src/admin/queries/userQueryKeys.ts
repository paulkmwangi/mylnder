export const userQueryKeys = {
  all: ["admin-user-data"] as const,
  users: (adminId: string) => ["admin-user-data", adminId, "users"] as const,
  user: (adminId: string, userId: string) =>
    ["admin-user-data", adminId, "user", userId] as const,
  image: (adminId: string, imageUrl: string) =>
    ["admin-user-data", adminId, "image", imageUrl] as const,
};
