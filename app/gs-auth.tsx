import generateAuth from "@/helpers/auth";

export const [GsAuth, useGsAuth] = generateAuth(
    "/gs-auth",
    "gs_auth",
    "gs.cookie",
    "https://api-transformer.onrender.com//https://www.gradescope.com/account/edit",
    "https://www.gradescope.com",
    "https://www.gradescope.com",
    cookie => ({
      "headers": JSON.stringify({
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cookie": cookie,
      })
    }),
    response => response.status === 200
        // && response.url === "https://api-transformer.onrender.com//https://www.gradescope.com/account/edit"
);

console.log("useGsAuth", useGsAuth);

export default GsAuth;
