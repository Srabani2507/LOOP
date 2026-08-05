import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

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
