"use client";
import { Control, Controller } from "react-hook-form";
import { Input } from "./ui/input";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { FormFieldType } from "./forms/PatientForm";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

interface CustomProps {
	control: Control<any>;
	fieldType: FormFieldType;
	name: string;
	label?: string;
	placeholder?: string;
	iconSrc?: string;
	iconAlt?: string;
	disabled?: boolean;
	dateFormat?: string;
	showTimeSelect?: boolean;
	minDate?: Date; // ✅ optional minDate
	restrictPastTime?: boolean; // ✅ restrict past time for today
	children?: React.ReactNode;
	renderSkeleton?: (field: any) => React.ReactNode;
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
	const {
		fieldType,
		iconSrc,
		iconAlt,
		placeholder,
		showTimeSelect,
		dateFormat,
		renderSkeleton,
		disabled,
		minDate,
		restrictPastTime,
	} = props;

	switch (fieldType) {
		case FormFieldType.INPUT:
			return (
				<div className='flex rounded-md border border-dark-500 bg-dark-400'>
					{iconSrc && (
						<Image
							src={iconSrc}
							alt={iconAlt || "icon"}
							height={24}
							width={24}
							className='ml-2'
						/>
					)}
					<Input
						className='shad-input border-0'
						type='text'
						placeholder={placeholder}
						disabled={disabled}
						{...field}
					/>
				</div>
			);

		case FormFieldType.TEXTAREA:
			return (
				<Textarea
					placeholder={placeholder}
					{...field}
					className='shad-textArea'
					disabled={disabled}
				/>
			);

		case FormFieldType.PHONE_INPUT:
			return (
				<PhoneInput
					defaultCountry='AZ'
					placeholder={placeholder}
					international
					withCountryCallingCode
					value={field.value as E164Number | undefined}
					onChange={field.onChange}
					disabled={disabled}
					className='input-phone'
				/>
			);

		case FormFieldType.DATE_PICKER:
			// ✅ Determine if selected date is today
			const selectedDate = field.value ? new Date(field.value) : null;
			const today = new Date();
			const isToday =
				selectedDate && selectedDate.toDateString() === today.toDateString();

			return (
				<div className='flex rounded-md border border-dark-500 bg-dark-400'>
					<Image
						src='/assets/icons/calendar.svg'
						height={24}
						width={24}
						alt='calendar'
						className='ml-2'
					/>

					<DatePicker
						dateFormat={dateFormat || "MM/dd/yyyy"}
						showTimeSelect={showTimeSelect || false}
						timeInputLabel='Time:'
						wrapperClassName='date-picker'
						selected={field.value}
						onChange={(date) => field.onChange(date)}
						disabled={disabled}
						minDate={minDate}
						minTime={
							restrictPastTime && isToday ? new Date() : new Date(0, 0, 0, 0, 0)
						}
						maxTime={new Date(0, 0, 0, 23, 59)} // always defined
					/>
				</div>
			);

		case FormFieldType.SELECT:
			return (
				<Select
					onValueChange={field.onChange}
					defaultValue={field.value}
					disabled={disabled}
				>
					<div>
						<SelectTrigger className='shad-select-trigger'>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
					</div>

					<SelectContent className='shad-select-content'>
						{props.children}
					</SelectContent>
				</Select>
			);

		case FormFieldType.CHECKBOX:
			return (
				<div className='flex items-center gap-4'>
					<Checkbox
						id={props.name}
						checked={field.value}
						onCheckedChange={field.onChange}
						disabled={disabled}
					/>
					<label htmlFor={props.name} className='checkbox-label'>
						{props.label}
					</label>
				</div>
			);

		case FormFieldType.SKELETON:
			return renderSkeleton ? renderSkeleton(field) : null;

		default:
			return null;
	}
};

const CustomFormField = (props: CustomProps) => {
	const { control, fieldType, name, label } = props;

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					{fieldType !== FormFieldType.CHECKBOX && label && (
						<FieldLabel htmlFor={name}>{label}</FieldLabel>
					)}

					<RenderField field={field} props={props} />

					{fieldState.error && (
						<FieldError className='shad-error'>
							{fieldState.error.message}
						</FieldError>
					)}
				</Field>
			)}
		/>
	);
};

export default CustomFormField;
