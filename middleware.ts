export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/members/:path*",
    "/reports/:path*",
    "/inbox/:path*",
    "/trends/:path*",
    "/ask/:path*",
  ],
};
