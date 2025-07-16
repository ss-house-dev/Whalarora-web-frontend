import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <div>
      <h1>Welcome to the Page</h1>
      <p>This is a simple page component.</p>
      <Button >
        Click Me
      </Button>
      <Input type="email" placeholder="Email" />
    </div>
  );
}