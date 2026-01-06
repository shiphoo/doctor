"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "../ui/field";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import { UserFormValidation } from "../../lib/validation";
import { useRouter } from "next/navigation";
import { createuser } from "@/lib/actions/patient.actions";

export enum FormFieldType {
	INPUT = "input",
	TEXTAREA = "textarea",
	CHECKBOX = "checkbox",
	PHONE_INPUT = "phoneInput",
	DATE_PICKER = "datePicker",
	SELECT = "select",
	SKELETON = "skeleton",
}

const PatientForm = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<z.infer<typeof UserFormValidation>>({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
		resolver: zodResolver(UserFormValidation),
	});

	async function onSubmit({
		name,
		email,
		phone,
	}: z.infer<typeof UserFormValidation>) {
		setIsLoading(true);

		try {
			const userData = {
				name,
				email,
				phone,
			};
			const user = await createuser(userData);
			if (user) router.push(`/patients/${user.$id}/register`);
		} catch (error) {
			console.log("Submission error:", error);
		}
	}
	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 flex-1'>
			<section className='mb-12 space-y-4'>
				<h1 className='header'>Hi there!</h1>
				<p className='text-dark-700'>Schedule your first appointment</p>
			</section>
			<FieldGroup className='flex'>
				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name='name'
					label='Full Name'
					placeholder='Faig Hajili'
					iconSrc='/assets/icons/user.svg'
					iconAlt='user'
				/>
				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name='email'
					label='Email'
					placeholder='faighajili@gmail.com'
					iconSrc='/assets/icons/email.svg'
					iconAlt='email'
				/>
				<CustomFormField
					fieldType={FormFieldType.PHONE_INPUT}
					control={form.control}
					name='phone'
					label='Phone number'
					placeholder='(55) 555-55-55'
				/>
				<SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
			</FieldGroup>
		</form>
	);
};

export default PatientForm;
