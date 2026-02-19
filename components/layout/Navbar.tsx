import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
            <span className="text-[9px] font-black tracking-widest text-background">
              EJ
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              EVOL Jewels
            </span>
            <span className="hidden text-xs text-muted-foreground/60 sm:block">
              / ops
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden h-7 text-xs text-muted-foreground hover:text-foreground sm:flex"
          >
            <Link href="/enquiries/new">New Enquiry</Link>
          </Button>
          <Button size="sm" asChild className="h-7 gap-1.5 text-xs">
            <Link href="/orders/new">
              <Plus className="h-3 w-3" />
              New Order
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
