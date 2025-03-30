import { authConfig } from "@/app/api/auth/[...nextauth]/auth.config";
import { Role } from "@prisma/client";
import { getServerSession, Session } from "next-auth";

// type SessionUser = {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: Role;
// };

// type Session = {
//   user: SessionUser;
//   expires: string;
// };

export async function checkRole(
  role: Role,
  msg: string = "You are not authorized for this action"
): Promise<Session> {
  const session = await getServerSession(authConfig)

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== role) {
    throw new Error(msg);
  }

  return session;
}
