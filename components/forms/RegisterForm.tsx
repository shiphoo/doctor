"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "../ui/field";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import {
	PatientFormValidation,
	UserFormValidation,
} from "../../lib/validation";
import { useRouter } from "next/navigation";
import { createuser, registerPatient } from "@/lib/actions/patient.actions";
import { FormFieldType } from "./PatientForm";
import { RadioGroup } from "@radix-ui/react-radio-group";
import {
	Doctors,
	GenderOptions,
	IdentificationTypes,
	PatientFormDefaultValues,
} from "@/constants";
import { Label } from "../ui/label";
import { RadioGroupItem } from "../ui/radio-group";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import FileUploader from "../FileUploader";

const RegisterForm = ({ user }: { user: User }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<z.infer<typeof PatientFormValidation>>({
		defaultValues: {
			...PatientFormDefaultValues,
			name: "",
			email: "",
			phone: "",
		},
		resolver: zodResolver(PatientFormValidation),
	});

	async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
		setIsLoading(true);
		let formData;

		if (
			values.identificationDocument &&
			values.identificationDocument.length > 0
		) {
			const blobFile = new Blob([values.identificationDocument[0]], {
				type: values.identificationDocument.type,
			});
			formData = new FormData();
			formData.append("blobFile", blobFile);
			formData.append("fileName", values.identificationDocument[0].name);
		}
		try {
			const patientData = {
				...values,
				userId: user.$id,
				birthDate: new Date(values.birthDate),
				identificationDocument: formData,
			};
			const patient = await registerPatient(patientData);
			if (patient) router.push(`/patients/${user.$id}/new-appointment`);
		} catch (error) {
			console.log("Submission error", error);
		}
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
		<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-12 flex-1'>
			<section className='space-y-4'>
				<h1 className='header'>Welcome</h1>
				<p className='text-dark-700'>Let us know more about yourself!</p>
			</section>
			<section className='mb-12 space-y-6'>
				<div className='mb-9 space-y-1'>
					<h2 className='sub-header'>Personal Information</h2>
				</div>
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
				<div className='flex flex-col gap-6 xl:flex-row'>
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
				</div>
				<div className='flex flex-col gap-6 xl:flex-row'>
					<CustomFormField
						fieldType={FormFieldType.DATE_PICKER}
						control={form.control}
						name='birthDate'
						label='Date of Birth'
					/>
					<CustomFormField
						fieldType={FormFieldType.SKELETON}
						control={form.control}
						name='gender'
						label='Gender'
						renderSkeleton={(field) => (
							<div>
								<RadioGroup
									className='flex h-11 gap-6 xl:justify-between'
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									{GenderOptions.map((option) => (
										<div key={option} className='radio-group'>
											<RadioGroupItem value={option} id={option} />
											<Label htmlFor={option} className='cursor-pointer'>
												{option}
											</Label>
										</div>
									))}
								</RadioGroup>
							</div>
						)}
					/>
				</div>
				{/* <div className='flex flex-col gap-6 xl:flex-row'>
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name='address'
						label='Address'
						placeholder='14th street, NY'
					/>
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name='occupation'
						label='Occupation'
						placeholder='Software Engineer'
					/>
				</div>
				<div className='flex flex-col gap-6 xl:flex-row'>
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name='emergencyContactName'
						label='Emergency Contact Name'
						placeholder='Guardians Name'
					/>
					<CustomFormField
						fieldType={FormFieldType.PHONE_INPUT}
						control={form.control}
						name='emergencyContactNumber'
						label='Emergency Contact Number'
						placeholder='(55) 555-55-55'
					/>
				</div> */}
				<section className='mt-5'>
					<div className='mb-5 space-y-1'>
						<h2 className='sub-header'>Medical Information</h2>
					</div>
				</section>
				<CustomFormField
					fieldType={FormFieldType.SELECT}
					control={form.control}
					name='primaryPhysician'
					label='Primary Physician'
					placeholder='Select a physician'
				>
					{Doctors.map((doctor) => (
						<SelectItem key={doctor.name} value={doctor.name}>
							<div className='flex cursor-pointer items-center gap-2'>
								<Image
									src={doctor.image}
									width={32}
									height={32}
									alt={doctor.name}
									className='rounded-full border border-dark-500'
								/>
								<p>{doctor.name}</p>
							</div>
						</SelectItem>
					))}
				</CustomFormField>
				{/* <div className='flex flex-col gap-6 xl:flex-row'>
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name='insuranceProvider'
						label='Insurance Provider'
						placeholder='Bluecross Blueshield'
					/>
					<CustomFormField
						fieldType={FormFieldType.INPUT}
						control={form.control}
						name='insurancePolicyNumber'
						label='Insurance Policy Number'
						placeholder='ABC123456789'
					/>
				</div>
				<div className='flex flex-col gap-6 xl:flex-row'>
					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name='allergies'
						label='Allergies (if any)'
						placeholder='Peanuts, Penicillin Pollen'
					/>
					<CustomFormField
						fieldType={FormFieldType.TEXTAREA}
						control={form.control}
						name='currentMedication'
						label='Current medication (if any)'
						placeholder='Ibuprofen 200mg'
					/>
				</div>
				<section className='mt-5'>
					<div className='mb-5 space-y-1'>
						<h2 className='sub-header'>Identification and Verification</h2>
					</div>
				</section>
				<CustomFormField
					fieldType={FormFieldType.SELECT}
					control={form.control}
					name='identificationType'
					label='Identification Type'
					placeholder='Select an identification type'
				>
					{IdentificationTypes.map((type) => (
						<SelectItem key={type} value={type}>
							{type}
						</SelectItem>
					))}
				</CustomFormField>
				<CustomFormField
					fieldType={FormFieldType.INPUT}
					control={form.control}
					name='identificationNumber'
					label='Identification number'
					placeholder='123456789'
				/>
				<CustomFormField
					fieldType={FormFieldType.SKELETON}
					control={form.control}
					name='identificationDocument'
					label='Scanned copy of identification document'
					renderSkeleton={(field) => (
						<FileUploader files={field.value} onChange={field.onChange} />
					)}
				/> */}
				<section className='mt-5'>
					<div className='mb-5 space-y-1'>
						<h2 className='sub-header'>Consent and Privacy</h2>
					</div>
				</section>
				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name='treatmentConsent'
					label='I consent to treatment for my health condition'
				/>
				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name='disclosureConsent'
					label='bla bla bla'
				/>
				<CustomFormField
					fieldType={FormFieldType.CHECKBOX}
					control={form.control}
					name='privacyConsent'
					label='bla2 bla2 bla2'
				/>
				<SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
			</FieldGroup>
		</form>
	);
};

export default RegisterForm;
