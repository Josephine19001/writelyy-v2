"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useCreateWorkspaceMutation,
	workspaceListQueryKey,
} from "@saas/workspaces/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
// import { PlusCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWorkspaceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateWorkspaceModal({
	isOpen,
	onClose,
}: CreateWorkspaceModalProps) {
	const queryClient = useQueryClient();
	const { setActiveWorkspace } = useActiveWorkspace();
	const createWorkspaceMutation = useCreateWorkspaceMutation();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
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

			form.reset();
			onClose();
			toast.success("Workspace created successfully!");
		} catch {
			toast.error("Failed to create workspace. Please try again.");
		}
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 mb-2">
						{/* <PlusCircleIcon className="size-5" /> */}
						Create New Workspace
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									{/* <FormLabel>Workspace Name</FormLabel> */}
									<FormControl>
										<Input
											{...field}
											placeholder="Enter workspace name"
											autoComplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-3 pt-4">
							{/* <Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className="flex-1"
							>
								Cancel
							</Button> */}
							<Button
								type="submit"
								loading={form.formState.isSubmitting}
								className="flex-1"
							>
								Create Workspace
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
