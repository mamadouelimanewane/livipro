import { Redirect } from "expo-router";
export default function ManifestRedirect() {
  return <Redirect href={"/(main)" as never} />;
}
