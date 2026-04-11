import { auth } from "@/auth";
import { QuestionBankClient } from "@/components/question-bank/question-bank-client";

export default async function QuestionBankPage() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return <QuestionBankClient />;
}