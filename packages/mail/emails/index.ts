import { EmailVerification } from "../emails/EmailVerification";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewsletterSignup } from "../emails/NewsletterSignup";
import { NewUser } from "../emails/NewUser";
import { WorkspaceInvitation } from "../emails/WorkspaceInvitation";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	newsletterSignup: NewsletterSignup,
	workspaceInvitation: WorkspaceInvitation,
	emailVerification: EmailVerification,
} as const;
