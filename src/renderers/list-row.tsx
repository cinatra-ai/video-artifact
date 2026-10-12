// The row icon of a video in the Artifacts list: the icon of the type, drawn at 17 pixels
// inside the application's 34 pixel cell. It reads nothing but its props and draws the same
// icon for every object type it receives.
import { Video } from "lucide-react";

export interface ListRowProps {
  artifact: { objectType: string };
}

export default function ListRow(_props: ListRowProps) {
  return <Video aria-hidden size={17} strokeWidth={2} data-row-glyph="video" />;
}
