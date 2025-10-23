import { createAvatarUploadUrl } from "./procedures/create-avatar-upload-url";
import { getUserCredits } from "./procedures/get-user-credits";

export const usersRouter = {
	avatarUploadUrl: createAvatarUploadUrl,
	getCredits: getUserCredits,
};
