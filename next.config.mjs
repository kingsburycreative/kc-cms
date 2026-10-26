/** @type {import('next').NextConfig} */
const nextConfig = {
	// KC: the client guides are static pages in public/guides/. A folder URL is
	// not served from public/, so each guide's address maps to its index.html.
	async rewrites() {
		return [
			{ source: "/guides/:client", destination: "/guides/:client/index.html" },
		];
	},
};

export default nextConfig;
