import { LoadingState } from "@/src/components/data-states";

export default function PublicLoading() {
  return (
    <div className="container section">
      <LoadingState label="Loading SFAU information" />
    </div>
  );
}
