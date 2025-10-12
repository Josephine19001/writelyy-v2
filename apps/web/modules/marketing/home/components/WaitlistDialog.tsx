"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
// import { Label } from "@ui/components/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface WaitlistDialogProps {
	children: React.ReactNode;
}

export function WaitlistDialog({ children }: WaitlistDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			// TODO: Replace with your Google Sheets Web App URL
			// Instructions to set up:
			// 1. Create a Google Sheet
			// 2. Go to Extensions > Apps Script
			// 3. Add the script to handle POST requests
			// 4. Deploy as Web App and get the URL
			const GOOGLE_SHEET_URL =
				process.env.NEXT_PUBLIC_WAITLIST_SHEET_URL || "";

			if (!GOOGLE_SHEET_URL) {
				// For now, simulate success if URL is not configured
				console.log("Waitlist submission:", formData);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setIsSuccess(true);
				return;
			}

			const response = await fetch(GOOGLE_SHEET_URL, {
				method: "POST",
				mode: "no-cors",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					timestamp: new Date().toISOString(),
				}),
			});

			// With no-cors mode, we can't read the response
			// Assume success after a delay
			setIsSuccess(true);
		} catch (err) {
			console.error("Error submitting to waitlist:", err);
			setError("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setOpen(false);
		// Reset form after close animation
		setTimeout(() => {
			setIsSuccess(false);
			setFormData({ name: "", email: "" });
			setError("");
		}, 300);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				{!isSuccess ? (
					<>
						<DialogHeader>
							<div className="flex items-center gap-2 mb-2">
								{/* <div className="p-2 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/50 dark:to-purple-950/50">
									<Sparkles className="h-5 w-5 text-fuchsia-500" />
								</div> */}
								<DialogTitle className="text-2xl">
									Join the Waitlist
								</DialogTitle>
							</div>
							<DialogDescription>
								Be the first to know when Writely launches.
								We'll send you exclusive early access.
							</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={handleSubmit}
							className="space-y-4 mt-4"
						>
							<div className="space-y-2">
								{/* <Label htmlFor="name">Name</Label> */}
								<Input
									id="name"
									type="text"
									placeholder="Your name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									required
									disabled={isSubmitting}
									className="h-11"
								/>
							</div>
							<div className="space-y-2">
								{/* <Label htmlFor="email">Email</Label> */}
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									required
									disabled={isSubmitting}
									className="h-11"
								/>
							</div>
							{error && (
								<p className="text-sm text-red-500 dark:text-red-400">
									{error}
								</p>
							)}
							<Button
								type="submit"
								className="w-full h-11 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500 hover:from-pink-500 hover:via-fuchsia-600 hover:to-purple-600 text-white font-semibold"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Joining...
									</>
								) : (
									"Join Waitlist"
								)}
							</Button>
						</form>
					</>
				) : (
					<div className="py-8 text-center">
						<div className="mb-4 flex justify-center">
							<div className="rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/50 dark:to-purple-950/50 p-3">
								<CheckCircle2 className="h-12 w-12 text-fuchsia-500" />
							</div>
						</div>
						<DialogTitle className="text-2xl mb-2">
							You're on the list!
						</DialogTitle>
						<DialogDescription className="text-base mb-6">
							Thank you for joining. We'll reach out soon with
							exclusive early access to Writely.
						</DialogDescription>
						<div className="flex justify-center">
							<Button
								onClick={handleClose}
								className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500 hover:from-pink-500 hover:via-fuchsia-600 hover:to-purple-600 text-white px-8"
							>
								Close
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
