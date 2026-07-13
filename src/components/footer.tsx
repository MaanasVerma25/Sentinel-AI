import { Link } from "@tanstack/react-router";
import { Radar, Mail, Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export function Footer() {
  const [open, setOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const email = "vermamaanas5@gmail.com";
  const phone = "+91 8765316576";

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        toast.success("Email copied to clipboard");
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
        toast.success("Phone number copied to clipboard");
      }
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <footer className="border-t border-[#343940] py-10 bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-[10px] font-mono uppercase tracking-wider text-[#6C7584] md:flex-row">
          <div className="flex items-center gap-2.5">
            <Radar className="h-4 w-4 text-[#298DFF]" />
            <span className="font-bold text-white">Sentinel AI</span>
            <span>· Real-time crisis detection</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors"
              activeProps={{ className: "text-[#298DFF]" }}
            >
              Privacy Policy
            </Link>
            <span className="text-[#343940]">|</span>
            <button
              onClick={() => setOpen(true)}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 outline-none uppercase font-mono text-[10px] tracking-wider"
            >
              Contact Us
            </button>
            <span className="text-[#343940]">|</span>
            <Link
              to="/terms"
              className="hover:text-white transition-colors"
              activeProps={{ className: "text-[#298DFF]" }}
            >
              Terms of Service
            </Link>
          </div>
          <span>© {new Date().getFullYear()} Sentinel AI. All rights reserved.</span>
        </div>
      </footer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-[#343940] bg-[#131518] text-white max-w-md p-6 font-mono rounded-none">
          <DialogHeader className="border-b border-[#343940] pb-4">
            <DialogTitle className="text-sm font-bold tracking-wider text-[#298DFF] uppercase flex items-center gap-2">
              <Radar className="h-4 w-4 animate-pulse text-[#298DFF]" />
              Contact Sentinel AI
            </DialogTitle>
            <DialogDescription className="text-[10px] text-[#6C7584] uppercase tracking-wider mt-1">
              Direct channels to the command center
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Email Channel */}
            <div className="flex flex-col gap-2 p-3 border border-[#343940] bg-black/40">
              <span className="text-[9px] text-[#6C7584] uppercase tracking-wider">Channel 01: Email</span>
              <div className="flex items-center justify-between">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-white hover:text-[#298DFF] transition-colors group"
                >
                  <Mail className="h-4 w-4 text-[#298DFF]" />
                  <span className="break-all font-mono">{email}</span>
                </a>
                <button
                  onClick={() => copyToClipboard(email, "email")}
                  className="p-1.5 hover:bg-[#1e2227] text-[#6C7584] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#343940]"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-[#2ed573]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Mobile Channel */}
            <div className="flex flex-col gap-2 p-3 border border-[#343940] bg-black/40">
              <span className="text-[9px] text-[#6C7584] uppercase tracking-wider">Channel 02: Mobile</span>
              <div className="flex items-center justify-between">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-white hover:text-[#298DFF] transition-colors group"
                >
                  <Phone className="h-4 w-4 text-[#298DFF]" />
                  <span className="font-mono">{phone}</span>
                </a>
                <button
                  onClick={() => copyToClipboard(phone, "phone")}
                  className="p-1.5 hover:bg-[#1e2227] text-[#6C7584] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#343940]"
                  title="Copy phone number"
                >
                  {copiedPhone ? <Check className="h-3.5 w-3.5 text-[#2ed573]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#343940]">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-[#343940] hover:bg-[#1e2227] text-[10px] uppercase tracking-wider text-white hover:text-[#298DFF] transition-colors cursor-pointer"
            >
              Close Signal
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
