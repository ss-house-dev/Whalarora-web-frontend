import { ExampleCombobox } from "@/components/ui/example-combobox";
import Navbar from "@/components/ui/Navbar";
export default function TradePage() {
  return (
    <div>
      <Navbar />
      <div className="flex items-center flex-start mt-10 space-x-5 mx-10">
        <ExampleCombobox></ExampleCombobox>
      </div>

    </div>
  );
}
