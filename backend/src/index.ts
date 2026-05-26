import { auth0Enabled, getAuth0CallbackUrl } from "./lib/auth0";
import app from "./app";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`CollageHunt backend running on port ${port}`);
  if (auth0Enabled()) {
    console.log(`Auth0 callback URL: ${getAuth0CallbackUrl()}`);
  }
});
