import generateAuth from "@/helpers/auth";

export const [CanvasAuth, useCanvasAuth] = generateAuth(
    "/canvas-auth",
    "canvas_auth",
    "canvas.cookie",
    "https://ucsb.instructure.com/api/v1/users/self",
    "https://ucsb.instructure.com/",
    "https://ucsb.instructure.com/",
    cookie => ({
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cookie": cookie
    }),
    response => response.ok
);

export default CanvasAuth;
