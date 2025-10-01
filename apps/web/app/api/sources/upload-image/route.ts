import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
	region: process.env.S3_REGION || "eu-north-1",
	endpoint: process.env.S3_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
	forcePathStyle: true, // Required for Supabase S3
});

export async function POST(request: NextRequest) {
	try {
		// Get the authenticated user
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 },
			);
		}

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Invalid file type. Only images are allowed." },
				{ status: 400 },
			);
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File too large. Maximum size is 10MB." },
				{ status: 400 },
			);
		}

		// Generate user-specific file path
		const fileExtension = file.name.split(".").pop();
		const fileName = `users/${session.user.id}/images/${Date.now()}-${uuidv4()}.${fileExtension}`;

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Upload to images bucket
		const bucketName =
			process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
		const uploadCommand = new PutObjectCommand({
			Bucket: bucketName,
			Key: fileName,
			Body: buffer,
			ContentType: file.type,
			// Note: ACL is not supported in Supabase S3
		});

		await s3Client.send(uploadCommand);

		// Return the file path for storage in database
		const response = {
			success: true,
			filePath: fileName,
			filename: file.name,
			size: file.size,
			type: file.type,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error uploading image:", error);
		console.error("S3 Config:", {
			endpoint: process.env.S3_ENDPOINT,
			region: process.env.S3_REGION,
			bucket: process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME,
		});
		return NextResponse.json(
			{
				error: "Failed to upload image",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}