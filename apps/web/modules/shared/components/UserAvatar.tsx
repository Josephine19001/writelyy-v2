import { config } from "@repo/config";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import { useMemo } from "react";

export const UserAvatar = ({
	name,
	avatarUrl,
	className,
	planId,
	showBadge = false,
	ref,
}: React.ComponentProps<typeof Avatar> & {
	name: string;
	avatarUrl?: string | null;
	className?: string;
	planId?: string;
	showBadge?: boolean;
}) => {
	const initials = useMemo(
		() =>
			name
				.split(" ")
				.slice(0, 2)
				.map((n) => n[0])
				.join(""),
		[name],
	);

	const avatarSrc = useMemo(
		() =>
			avatarUrl
				? avatarUrl.startsWith("http")
					? avatarUrl
					: `/image-proxy/${config.storage.bucketNames.avatars}/${avatarUrl}`
				: undefined,
		[avatarUrl],
	);

	const isPro = planId === "pro";

	return (
		<div className="relative inline-block">
			<Avatar ref={ref} className={className}>
				<AvatarImage src={avatarSrc} />
				<AvatarFallback className="bg-secondary/10 text-secondary">
					{initials}
				</AvatarFallback>
			</Avatar>
			{showBadge && (
				<div
					className={`absolute -bottom-1 -right-1 rounded px-1 py-0.5 text-[8px] font-bold text-white ${
						isPro
							? "bg-gradient-to-r from-purple-500 to-pink-500"
							: "bg-gray-500 dark:bg-gray-600"
					}`}
				>
					{isPro ? "PRO" : "FREE"}
				</div>
			)}
		</div>
	);
};

UserAvatar.displayName = "UserAvatar";
