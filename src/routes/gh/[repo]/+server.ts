import { redirect } from "@sveltejs/kit";

export const GET = ({ params }) => {
  return Response.redirect(
    `https://github.com/tricked-dev/${params.repo}`,
  );
};
