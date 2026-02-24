"use server";

import { ID, Query } from "node-appwrite";
import {
	APPOINTMENT_TABLE_ID,
	DATABASE_ID,
	databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { ca } from "zod/v4/locales";
import { Appointment } from "@/types/appwrite";
import { NextRequest, NextResponse } from "next/server";
export const sendWhatsappMessage = async (
	to: string,
	content: string,
): Promise<boolean> => {
	try {
		if (!to) {
			console.log("couldnt do it");
			return false;
		}

		// Remove + and spaces
		const cleaned = to.replace(/\+/g, "").replace(/\s/g, "").trim();

		// Basic validation (Azerbaijan example: 994XXXXXXXXX)
		if (!/^994\d{9}$/.test(cleaned)) {
			console.log("couldnt do it");
			return false;
		}

		const phoneNumber = `${cleaned}@c.us`;

		// Add timeout protection (5 seconds)
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(
			"https://unrespectable-ashleigh-abstainedly.ngrok-free.dev/messages/message",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					phoneNumber,
					message: content,
				}),
				signal: controller.signal,
			},
		);

		clearTimeout(timeout);

		if (!response.ok) {
			console.log("couldnt do it");
			return false;
		}

		return true; // success
	} catch (error) {
		console.log("couldnt do it");
		return false; // NEVER throw
	}
};

export const createAppointment = async (
	appointment: CreateAppointmentParams,
) => {
	try {
		const newAppointment = await databases.createDocument(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			ID.unique(),
			appointment,
		);
		return parseStringify(newAppointment);
	} catch (error) {
		console.log(error);
	}
};

export const getAppointment = async (appointmentId: string) => {
	try {
		const appointment = await databases.getDocument(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			appointmentId,
		);
		return parseStringify(appointment);
	} catch (error) {
		console.log(error);
	}
};

import { getPatient } from "./patient.actions"; // make sure path is correct
import { revalidatePath } from "next/cache";
import { send } from "process";

export const getRecentAppointmentList = async () => {
	try {
		const appointments = await databases.listDocuments(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			[Query.orderDesc("$createdAt")],
		);

		const initialCounts = {
			scheduledCount: 0,
			pendingCount: 0,
			cancelledCount: 0,
		};

		const counts = (appointments.documents as Appointment[]).reduce(
			(acc, appointment) => {
				switch (appointment.status) {
					case "scheduled":
						acc.scheduledCount++;
						break;
					case "pending":
						acc.pendingCount++;
						break;
					case "cancelled":
						acc.cancelledCount++;
						break;
				}
				return acc;
			},
			initialCounts,
		);

		// Fetch patient for each appointment in parallel
		const documentsWithPatients = await Promise.all(
			(appointments.documents as Appointment[]).map(async (appointment) => {
				const patient = await getPatient(appointment.userId);
				return {
					...appointment,
					patient, // add full patient object here
				};
			}),
		);

		const data = {
			totalCount: appointments.total,
			...counts,
			documents: documentsWithPatients,
		};

		return parseStringify(data);
	} catch (error) {
		console.error(
			"An error occurred while retrieving the recent appointments:",
			error,
		);
	}
};

export const updateAppointment = async ({
	appointmentId,
	userId,
	appointment,
	type,
}: UpdateAppointmentParams) => {
	try {
		const updateAppointment = await databases.updateDocument(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			appointmentId,
			appointment,
		);
		if (!updateAppointment) {
			throw new Error("Failed to update appointment");
		}
		const patient = await getPatient(userId);

		const dateObj = new Date(updateAppointment.schedule);

		const formattedDate = dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const formattedTime = dateObj.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
		const smsContent = `Hello, ${
			type === "schedule"
				? `Your appointment has been scheduled for ${formattedDate} at ${formattedTime}.`
				: `We are sorry to inform you that your appointment scheduled for ${formattedDate} at ${formattedTime} has been cancelled. Reason: ${appointment.cancellationReason || "Not specified"}.`
		}
		 `;

		await sendWhatsappMessage(patient.phone, smsContent);
		revalidatePath(`/admin`);
		return parseStringify(updateAppointment);
	} catch (error) {
		console.log(error);
	}
};
