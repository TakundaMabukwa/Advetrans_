import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicInputProps {
  inputs: Array<any>;
  handleSelectChange: (name: string, value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DynamicInput = ({
  inputs,
  handleSelectChange,
  handleChange,
}: DynamicInputProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inputs.map((input: any) =>
        input.type === "select" ? (
          <div className="space-y-2" key={input.htmlFor}>
            <Label htmlFor={input.htmlFor}>{input.label}</Label>
            <Select
              value={input.value}
              onValueChange={(value) =>
                handleSelectChange(input.htmlFor, value)
              }
            >
              <SelectTrigger
                id={input.htmlFor}
                className="w-full border-[#d3d3d3]"
              >
                <SelectValue placeholder={input.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(input?.options) &&
                  input.options.map(
                    (option: { value: string; label: string }) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    )
                  )}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div key={input.htmlFor} className="space-y-2">
            <Label htmlFor={input.htmlFor}>{input.label}</Label>
            <Input
              id={input.htmlFor}
              name={input.htmlFor}
              value={input.value}
              placeholder={input.placeholder || ""}
              type={input.type || "text"}
              onChange={handleChange}
              readOnly={input.readOnly ? input.readOnly : false}
              className={`${
                input.readOnly ? "bg-muted" : "bg-white"
              } border-[#d3d3d3]`}
            />
          </div>
        )
      )}
    </div>
  );
};

export default DynamicInput;
