/**
 * Document backup utility to prevent data loss
 */

const BACKUP_KEY_PREFIX = "doc-backup-";
const MAX_BACKUPS_PER_DOCUMENT = 5;

export interface DocumentBackup {
	content: any;
	timestamp: string;
	documentId: string;
	title: string;
	version: number;
}

/**
 * Create a backup of document content
 */
export function createDocumentBackup(
	documentId: string,
	content: any,
	title = "Untitled",
): void {
	try {
		const backupKey = `${BACKUP_KEY_PREFIX}${documentId}`;
		const existingBackups = getDocumentBackups(documentId);

		// Only create backup if content is different from the latest backup
		if (existingBackups.length > 0) {
			const latestBackup = existingBackups[0];
			if (
				JSON.stringify(latestBackup.content) === JSON.stringify(content)
			) {
				return; // No changes, skip backup
			}
		}

		const backup: DocumentBackup = {
			content,
			timestamp: new Date().toISOString(),
			documentId,
			title,
			version: (existingBackups[0]?.version || 0) + 1,
		};

		// Add new backup to the beginning
		const updatedBackups = [backup, ...existingBackups];

		// Keep only the latest N backups
		const trimmedBackups = updatedBackups.slice(
			0,
			MAX_BACKUPS_PER_DOCUMENT,
		);

		localStorage.setItem(backupKey, JSON.stringify(trimmedBackups));

		console.log(
			`📦 Created backup v${backup.version} for document ${documentId}`,
		);
	} catch (error) {
		console.error("Failed to create document backup:", error);
	}
}

/**
 * Get all backups for a document
 */
export function getDocumentBackups(documentId: string): DocumentBackup[] {
	try {
		const backupKey = `${BACKUP_KEY_PREFIX}${documentId}`;
		const stored = localStorage.getItem(backupKey);

		if (!stored) return [];

		return JSON.parse(stored) as DocumentBackup[];
	} catch (error) {
		console.error("Failed to retrieve document backups:", error);
		return [];
	}
}

/**
 * Restore a specific backup version
 */
export function restoreDocumentBackup(
	documentId: string,
	version: number,
): DocumentBackup | null {
	try {
		const backups = getDocumentBackups(documentId);
		const backup = backups.find((b) => b.version === version);

		if (backup) {
			console.log(
				`🔄 Restored backup v${version} for document ${documentId}`,
			);
			return backup;
		}

		return null;
	} catch (error) {
		console.error("Failed to restore document backup:", error);
		return null;
	}
}

/**
 * Get the latest backup for a document
 */
export function getLatestDocumentBackup(
	documentId: string,
): DocumentBackup | null {
	const backups = getDocumentBackups(documentId);
	return backups.length > 0 ? backups[0] : null;
}

/**
 * Clear all backups for a document
 */
export function clearDocumentBackups(documentId: string): void {
	try {
		const backupKey = `${BACKUP_KEY_PREFIX}${documentId}`;
		localStorage.removeItem(backupKey);
		console.log(`🗑️  Cleared all backups for document ${documentId}`);
	} catch (error) {
		console.error("Failed to clear document backups:", error);
	}
}

/**
 * Emergency content recovery - searches all localStorage for document content
 */
export function emergencyContentRecovery(
	documentId: string,
): Array<{ key: string; content: any; timestamp?: string }> {
	const recoveredData: Array<{
		key: string;
		content: any;
		timestamp?: string;
	}> = [];

	try {
		// Search through all localStorage keys for this document
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key) continue;

			// Check if key is related to this document
			if (key.includes(documentId)) {
				try {
					const data = localStorage.getItem(key);
					if (data) {
						const parsed = JSON.parse(data);

						// Extract content and timestamp if available
						if (parsed.content) {
							recoveredData.push({
								key,
								content: parsed.content,
								timestamp: parsed.timestamp || "Unknown",
							});
						}
					}
				} catch (parseError) {
					// Skip invalid JSON
				}
			}
		}

		// Sort by timestamp (newest first)
		recoveredData.sort((a, b) => {
			if (!a.timestamp || !b.timestamp) return 0;
			return (
				new Date(b.timestamp).getTime() -
				new Date(a.timestamp).getTime()
			);
		});

		if (recoveredData.length > 0) {
			console.log(
				`🚨 Emergency recovery found ${recoveredData.length} potential content versions for document ${documentId}`,
			);
		}
	} catch (error) {
		console.error("Emergency content recovery failed:", error);
	}

	return recoveredData;
}
