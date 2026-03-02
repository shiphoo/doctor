import PatientForm from "@/components/forms/PatientForm";
import PasskeyModal from "@/components/ui/PasskeyModal";
import Image from "next/image";
import Link from "next/link";
export default async function Home({ searchParams }: SearchParamProps) {
	const searchParams1 = await searchParams;
	const isAdmin = (await searchParams1.admin) === "true";
	console.log(isAdmin);

	return (
		<div className='flex h-screen max-h-screen'>
			{isAdmin && <PasskeyModal />}
			<section className='remove-scrollbar container my-auto'>
				<div className='sub-container max-w-[496px]'>
					<PatientForm />
					<div className='text-14-regular flex justify-between'>
						<p className='copyright py-12'>© 2026 Faig Hajili</p>

						<Link href='/?admin=true' className='text-green-500 py-12'>
							Admin
						</Link>
					</div>
				</div>
			</section>
			<Image
				src='/assets/images/onboarding-img.png'
				height={1000}
				width={1000}
				alt='patient'
				className='side-img max-w-[50%]'
			/>
		</div>
	);
}
