import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '195e81591adfb05cffee44e053b4309db79e0f4e', queries,  });
export default client;
  