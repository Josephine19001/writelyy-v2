import type { Config } from "./types";

export const config = {
	appName: "Writelyy - AI for documenting",
	// Internationalization
	i18n: {
		// Whether internationalization should be enabled (if disabled, you still need to define the locale you want to use below and set it as the default locale)
		enabled: false,
		// Define all locales here that should be available in the app
		// You need to define a label that is shown in the language selector and a currency that should be used for pricing with this locale
		locales: {
			en: {
				currency: "USD",
				label: "English",
			},
			de: {
				currency: "USD",
				label: "Deutsch",
			},
		},
		// The default locale is used if no locale is provided
		defaultLocale: "en",
		// The default currency is used for pricing if no currency is provided
		defaultCurrency: "USD",
		// The name of the cookie that is used to determine the locale
		localeCookieName: "NEXT_LOCALE",
	},
	// Workspaces
	workspaces: {
		// Whether workspaces are enabled in general
		enable: true,
		// Whether billing for workspaces should be enabled (below you can enable it for users instead)
		enableBilling: false,
		// Whether the workspace should be hidden from the user (use this for multi-tenant applications)
		hideWorkspace: false,
		// Should users be able to create new workspaces? Otherwise only admin users can create them
		enableUsersToCreateWorkspaces: true,
		// Whether users should be required to be in an workspace. This will redirect users to the workspace page after sign in
		requireWorkspace: false,
		// Define forbidden workspace slugs. Make sure to add all paths that you define as a route after /app/... to avoid routing issues
		forbiddenWorkspaceSlugs: [
			"new-workspace",
			"admin",
			"settings",
			"ai-demo",
			"workspace-invitation",
		],
	},
	// Users
	users: {
		// Whether billing should be enabled for users (above you can enable it for workspaces instead)
		enableBilling: true,
		// Whether you want the user to go through an onboarding form after signup (can be defined in the OnboardingForm.tsx)
		enableOnboarding: true,
	},
	// Authentication
	auth: {
		// Whether users should be able to create accounts (otherwise users can only be by admins)
		enableSignup: true,
		// Whether users should be able to sign in with a magic link
		enableMagicLink: true,
		// Whether users should be able to sign in with a social provider
		enableSocialLogin: true,
		// Whether users should be able to sign in with a passkey
		enablePasskeys: false,
		// Whether users should be able to sign in with a password
		enablePasswordLogin: true,
		// Whether users should be activate two factor authentication
		enableTwoFactor: true,
		// where users should be redirected after the sign in
		redirectAfterSignIn: "/app",
		// where users should be redirected after logout
		redirectAfterLogout: "/",
		// how long a session should be valid
		sessionCookieMaxAge: 60 * 60 * 24 * 30,
	},
	// Mails
	mails: {
		// the from address for mails
		from: "team@writelyy.app",
	},
	// Frontend
	ui: {
		// the themes that should be available in the app
		enabledThemes: ["light", "dark"],
		// the default theme
		defaultTheme: "light",
		// the saas part of the application
		saas: {
			// whether the saas part should be enabled (otherwise all routes will be redirect to the marketing page)
			enabled: true,
			// whether the sidebar layout should be used
			useSidebarLayout: true,
		},
		// the marketing part of the application
		marketing: {
			// whether the marketing features should be enabled (otherwise all routes will be redirect to the saas part)
			enabled: true,
		},
	},
	// Storage
	storage: {
		// define the name of the buckets for the different types of files
		bucketNames: {
			avatars: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME ?? "avatars",
		},
	},
	contactForm: {
		// whether the contact form should be enabled
		enabled: true,
		// the email to which the contact form messages should be sent
		to: "team@writelyy.app",
		// the subject of the email
		subject: "Contact form message",
	},
	// Payments
	payments: {
		// define the products that should be available in the checkout
		plans: {
			// The free plan is treated differently. It will automatically be assigned if the user has no other plan.
			free: {
				isFree: true,
			},
			pro: {
				recommended: true,
				prices: [
					{
						type: "recurring",
						productId: process.env
							.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY as string,
						amount: 10.0,
						currency: "USD",
						interval: "month",
					},
					{
						type: "recurring",
						productId: process.env
							.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY as string,
						amount: 100.0,
						currency: "USD",
						interval: "year",
					},
				],
			},
			// lifetime: {
			// 	prices: [
			// 		{
			// 			type: "one-time",
			// 			productId: process.env
			// 				.NEXT_PUBLIC_PRICE_ID_LIFETIME as string,
			// 			amount: 799,
			// 			currency: "USD",
			// 		},
			// 	],
			// },
			// enterprise: {
			// 	isEnterprise: false,
			// },
		},
	},
} as const satisfies Config;

export type { Config };
