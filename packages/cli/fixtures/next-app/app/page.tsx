import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main>
      <Input accessibilityLabel="Name" />
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Fixture dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    </main>
  );
}
