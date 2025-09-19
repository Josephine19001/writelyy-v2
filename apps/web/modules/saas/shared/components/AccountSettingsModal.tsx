"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
// Hooks for data fetching
import { useUserAccountsQuery } from "@saas/auth/lib/api";
import { ActivePlan } from "@saas/payments/components/ActivePlan";
import { ChangePlan } from "@saas/payments/components/ChangePlan";
import { useUserPurchases } from "@saas/payments/hooks/purchases";
import { ActiveSessionsBlock } from "@saas/settings/components/ActiveSessionsBlock";
import { ChangeEmailForm } from "@saas/settings/components/ChangeEmailForm";
import { ChangeNameForm } from "@saas/settings/components/ChangeNameForm";
import { ChangePasswordForm } from "@saas/settings/components/ChangePassword";
import { ConnectedAccountsBlock } from "@saas/settings/components/ConnectedAccountsBlock";
import { DeleteAccountForm } from "@saas/settings/components/DeleteAccountForm";
import { PasskeysBlock } from "@saas/settings/components/PasskeysBlock";
import { SetPasswordForm } from "@saas/settings/components/SetPassword";
import { TwoFactorBlock } from "@saas/settings/components/TwoFactorBlock";
import { UserAvatarForm } from "@saas/settings/components/UserAvatarForm";
import { UserLanguageForm } from "@saas/settings/components/UserLanguageForm";
// Import the actual settings components
import { SettingsList } from "@saas/shared/components/SettingsList";
import { Dialog, DialogContent } from "@ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { AlertTriangle, CreditCard, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface AccountSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AccountSettingsModal({
	isOpen,
	onClose,
}: AccountSettingsModalProps) {
	const t = useTranslations();
	const { user } = useSession();
	const [activeTab, setActiveTab] = useState("general");

	// Fetch user accounts to determine if user has password
	const { data: userAccounts } = useUserAccountsQuery();
	const userHasPassword = userAccounts?.some(
		(account) => account.providerId === "credential",
	);

	// Fetch purchases for billing
	const { activePlan } = useUserPurchases();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-4">
				<div className="flex h-[600px]">
					{/* Sidebar Navigation */}
					<div className="bg-muted/30 p-6">
						<Tabs
							orientation="vertical"
							value={activeTab}
							onValueChange={setActiveTab}
						>
							<TabsList className="grid w-full grid-rows-4 h-auto bg-transparent gap-3">
								<TabsTrigger
									value="general"
									className="justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm h-12 px-4"
								>
									<User className="h-4 w-4 mr-3" />
									{t("settings.general", {
										default: "General",
									})}
								</TabsTrigger>

								{config.users.enableBilling && (
									<TabsTrigger
										value="billing"
										className="justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm h-12 px-4"
									>
										<CreditCard className="h-4 w-4 mr-3" />
										{t("settings.billing.title", {
											default: "Billing",
										})}
									</TabsTrigger>
								)}

								<TabsTrigger
									value="security"
									className="justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm h-12 px-4"
								>
									<Shield className="h-4 w-4 mr-3" />
									{t("settings.security", {
										default: "Security",
									})}
								</TabsTrigger>

								<TabsTrigger
									value="danger-zone"
									className="justify-start data-[state=active]:bg-background data-[state=active]:shadow-sm text-destructive data-[state=active]:text-destructive h-12 px-4"
								>
									<AlertTriangle className="h-4 w-4 mr-3" />
									{t("settings.dangerZone", {
										default: "Danger Zone",
									})}
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Content Area */}
					<div className="flex-1 overflow-y-auto">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							{/* General Settings */}
							<TabsContent value="general" className="p-6 m-0">
								<SettingsList>
									<UserAvatarForm />
									{config.i18n.enabled && (
										<UserLanguageForm />
									)}
									<ChangeNameForm />
									<ChangeEmailForm />
								</SettingsList>
							</TabsContent>

							{/* Billing Settings */}
							{config.users.enableBilling && (
								<TabsContent
									value="billing"
									className="p-6 m-0"
								>
									<SettingsList>
										{activePlan && <ActivePlan />}
										<ChangePlan
											userId={user?.id}
											activePlanId={activePlan?.id}
										/>
									</SettingsList>
								</TabsContent>
							)}

							{/* Security Settings */}
							<TabsContent value="security" className="p-6 m-0">
								<SettingsList>
									{config.auth.enablePasswordLogin &&
										(userHasPassword ? (
											<ChangePasswordForm />
										) : (
											<SetPasswordForm />
										))}
									{config.auth.enableSocialLogin && (
										<ConnectedAccountsBlock />
									)}
									{config.auth.enablePasskeys && (
										<PasskeysBlock />
									)}
									{config.auth.enableTwoFactor && (
										<TwoFactorBlock />
									)}
									<ActiveSessionsBlock />
								</SettingsList>
							</TabsContent>

							{/* Danger Zone */}
							<TabsContent
								value="danger-zone"
								className="p-6 m-0"
							>
								<SettingsList>
									<DeleteAccountForm />
								</SettingsList>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
