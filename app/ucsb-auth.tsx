import generateAuth from "@/helpers/auth";

export const [UCSBAuth, useUCSBAuth] = generateAuth(
    "/ucsb-auth",
    "ucsb_auth",
    "ucsb.cookie",
    "https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/Home.aspx",
    "https://my.sa.ucsb.edu/gold/Home.aspx",
    "https://my.sa.ucsb.edu/gold/",
    cookie => ({
      "headers": JSON.stringify({
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cookie": cookie,
      })
    }),
    response => response.status === 200
        && response.url === "https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/Home.aspx"
);

export default UCSBAuth;
