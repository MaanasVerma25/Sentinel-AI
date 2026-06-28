import { MessageSquare, Twitter, Star, Mail } from "lucide-react";
import type { SourceKind } from "@/lib/mock-data";

const map = {
  chat: { Icon: MessageSquare, label: "Chat" },
  social: { Icon: Twitter, label: "Social" },
  review: { Icon: Star, label: "Review" },
  email: { Icon: Mail, label: "Email" },
};

export function SourceIcon({
  kind,
  className = "h-3.5 w-3.5",
}: {
  kind: SourceKind;
  className?: string;
}) {
  const { Icon } = map[kind];
  return <Icon className={className} />;
}

export function SourceBadges({ sources }: { sources: SourceKind[] }) {
  return (
    <div className="flex items-center gap-1">
      {sources.map((s) => {
        const { Icon, label } = map[s];
        return (
          <span
            key={s}
            title={label}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-secondary text-muted-foreground border border-border"
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        );
      })}
    </div>
  );
}
