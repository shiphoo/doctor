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

export const createAppointment = async (
	appointment: CreateAppointmentParams
) => {
	try {
		const newAppointment = await databases.createDocument(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			ID.unique(),
			appointment
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
			appointmentId
		);
		return parseStringify(appointment);
	} catch (error) {
		console.log(error);
	}
};

import { getPatient } from "./patient.actions"; // make sure path is correct
import { revalidatePath } from "next/cache";

export const getRecentAppointmentList = async () => {
	try {
		const appointments = await databases.listDocuments(
			DATABASE_ID!,
			APPOINTMENT_TABLE_ID!,
			[Query.orderDesc("$createdAt")]
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
			initialCounts
		);

		// Fetch patient for each appointment in parallel
		const documentsWithPatients = await Promise.all(
			(appointments.documents as Appointment[]).map(async (appointment) => {
				const patient = await getPatient(appointment.userId);
				return {
					...appointment,
					patient, // add full patient object here
				};
			})
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
			error
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
			appointment
		);
		if (!updateAppointment) {
			throw new Error("Failed to update appointment");
		}
		//sms notification logic can be added here
		if (type === "schedule") {
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

			await sendWhatsAppTemplate({
				to: "994705085021",
				templateName: "appointment_confirmed",
				params: [
					patient.name, // {{1}}
					updateAppointment.primaryPhysician, // {{2}}
					formattedDate, // {{3}}
					formattedTime, // {{4}}
				],
			});
		}
		revalidatePath(`/admin`);
		return parseStringify(updateAppointment);
	} catch (error) {
		console.log(error);
	}
};
export const sendWhatsAppTemplate = async ({
	to,
	templateName,
	params,
}: {
	to: string;
	templateName: string;
	params: string[];
}) => {
	try {
		const res = await fetch(
			"https://graph.facebook.com/v22.0/846086671930463/messages",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messaging_product: "whatsapp",
					to,
					type: "template",
					template: {
						name: templateName,
						language: { code: "en_US" },
						components: [
							{
								type: "body",
								parameters: params.map((text) => ({
									type: "text",
									text,
								})),
							},
						],
					},
				}),
			}
		);

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error?.message || "WhatsApp API error");
		}

		return data;
	} catch (error) {
		console.error("WhatsApp send failed:", error);
	}
};
