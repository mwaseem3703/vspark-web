import { redirect } from "next/navigation";

export const metadata = { title: "Your dashboard — VSpark" };

export default function Page() {
  redirect("/dashboard/task");
}
