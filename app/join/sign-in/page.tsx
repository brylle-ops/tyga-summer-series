import { redirect } from "next/navigation";

// The old join step: sign-in is now one open screen.
export default function SignIn() {
  redirect("/login");
}
