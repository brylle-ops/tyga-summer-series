import { Screen } from "@/components/ui";

// Shown instantly while a page loads, so tapping a section never looks frozen.
export default function Loading() {
  return (
    <Screen>
      <div className="skel" style={{ height: 22, width: "40%" }} />
      <div className="skel" style={{ height: 120 }} />
      <div className="skel" style={{ height: 74 }} />
      <div className="skel" style={{ height: 74 }} />
    </Screen>
  );
}
