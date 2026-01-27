import { auth } from "@/auth";
import { getUserById } from "@/app/actions/user-actions";
import { UserForm } from "@/components/dashboard/users/UserForm";
import { notFound, redirect } from "next/navigation";

interface EditUserPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const session = await auth();

    if (session?.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const { userId } = await params;
    const user = await getUserById(userId);

    if (!user) {
        notFound();
    }

    return <UserForm initialData={user} />;
}
