"use server";

import { ID, Query } from "node-appwrite";
import {
	BUCKET_ID,
	DATABASE_ID,
	databases,
	ENDPOINT,
	PATIENT_TABLE_ID,
	PROJECT_ID,
	storage,
	users,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { InputFile } from "node-appwrite/file";

export const createuser = async (user: CreateUserParams) => {
	try {
		const newUser = await users.create(
			ID.unique(),
			user.email,
			user.phone,
			undefined,
			user.name,
		);

		return newUser;
	} catch (error: any) {
		if (error?.code === 409) {
			// User already exists → fetch existing user
			const existingUsers = await users.list([
				Query.equal("email", [user.email]),
			]);

			return existingUsers?.users[0];
		}

		throw error;
	}
};
export const getUser = async (userId: string) => {
	try {
		const user = await users.get(userId);
		return parseStringify(user);
	} catch (error) {
		console.log("Error fetching user:", error);
	}
};
export const getPatient = async (userId: string) => {
	try {
		const patients = await databases.listDocuments(
			DATABASE_ID!,
			PATIENT_TABLE_ID!,
			[Query.equal("userId", userId)],
		);

		const patient = patients.documents[0];

		if (!patient) return null; // 🔥 FIX HERE

		return parseStringify(patient);
	} catch (error) {
		console.log("Error fetching user:", error);
		return null;
	}
};

export const registerPatient = async ({
	identificationDocument,
	...patient
}: RegisterUserParams) => {
	try {
		let file;
		if (identificationDocument) {
			const inputFile = InputFile.fromBuffer(
				identificationDocument?.get("blobFile") as Blob,
				identificationDocument?.get("fileName") as string,
			);

			file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
		}
		const newPatient = await databases.createDocument(
			DATABASE_ID!,
			PATIENT_TABLE_ID!,
			ID.unique(),
			{
				// identificationDocumentId: file?.$id || null,
				// identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
				...patient,
			},
		);
		return parseStringify(newPatient);
	} catch (error) {
		console.log(error);
	}
};
