"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useCreateWorkspaceMutation,
	workspaceListQueryKey,
} from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWorkspaceForm({ defaultName }: { defaultName?: string }) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { setActiveWorkspace } = useActiveWorkspace();
	const createWorkspaceMutation = useCreateWorkspaceMutation();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: defaultName ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ name }) => {
		try {
			const newWorkspace = await createWorkspaceMutation.mutateAsync({
				name,
			});

			if (!newWorkspace) {
				throw new Error("Failed to create workspace");
			}

			await setActiveWorkspace(newWorkspace.slug);

			await queryClient.invalidateQueries({
				queryKey: workspaceListQueryKey,
			});

			router.replace(`/app/${newWorkspace.slug}`);
		} catch {
			toast.error(t("workspaces.createForm.notifications.error"));
		}
	});

	return (
		<div className="mx-auto w-full max-w-md">
			<h1 className="font-bold text-xl md:text-2xl">
				{t("workspaces.createForm.title")}
			</h1>
			<p className="mt-2 mb-6 text-foreground/60">
				{t("workspaces.createForm.subtitle")}
			</p>

			<Form {...form}>
				<form onSubmit={onSubmit}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("workspaces.createForm.name")}
								</FormLabel>
								<FormControl>
									<Input {...field} autoComplete="email" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						className="mt-6 w-full"
						type="submit"
						loading={form.formState.isSubmitting}
					>
						{t("workspaces.createForm.submit")}
					</Button>
				</form>
			</Form>
		</div>
	);
}
