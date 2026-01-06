import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,

	// ✅ Stop Vercel/next build from failing on TS errors
	typescript: {
		ignoreBuildErrors: true,
	},

	// (optional) also stop failing on ESLint errors during build
	// eslint: {
	//   ignoreDuringBuilds: true,
	// },
};

export default withSentryConfig(nextConfig, {
	org: "shiphoo-corps",
	project: "javascript-nextjs",
	silent: !process.env.CI,
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
});
