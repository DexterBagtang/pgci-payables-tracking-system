import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // You might need to adjust this import based on your setup

const frameworks = [
    { value: "react", label: "React ReactReactReactReactReactReactReactReactReactReactReactReactReactReactReactReactReact" },
    { value: "vue", label: " Vue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.jsVue.js" },
    { value: "angular", label: "AngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngularAngular" },
    { value: "svelte", label: "SvelteSvelteSvelteSvelteSvelteSvelteSvelteSvelteSvelteSvelte" },
    { value: "next", label: "NextNextNextNextNextNextNextNextNextNextNextNextNext.js" },
    { value: "nuxt", label: "NuxtNuxtNuxtNuxtNuxtNuxtNuxtNuxtNuxtNuxtNuxtNuxt.js" },
    { value: "remix", label: "RemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemixRemix" },
    { value: "astro", label: "AstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstroAstro" },
];

export default function TestComponent() {
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [value, setValue] = useState("");

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Dialog with Combobox Test
            </h1>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Select Framework
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Choose a Framework</DialogTitle>
                        <DialogDescription>
                            Select your preferred JavaScript framework from the list below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <div className="w-[300px]">
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                    <span className="truncate max-w-[300px]">
                                        {value
                                            ? frameworks.find((framework) => framework.value === value)?.label
                                            : "Select framework..."}
                                    </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto p-0">
                                <Command>
                                    <CommandInput placeholder="Search framework..." />
                                    <CommandEmpty>No framework found.</CommandEmpty>
                                    <CommandGroup>
                                        {frameworks.map((framework) => (
                                            <CommandItem
                                                key={framework.value}
                                                value={framework.value}
                                                onSelect={(currentValue) => {
                                                    setValue(currentValue === value ? "" : currentValue);
                                                    setOpen(false);
                                                }}
                                                className="flex items-center"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 shrink-0",
                                                        value === framework.value ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="truncate flex-1">{framework.label}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {value && (
                        <div className="mt-4 p-4 bg-muted rounded-lg w-[300px]">
                            <p className="text-sm truncate">
                                <span className="font-medium">Selected:</span>{" "}
                                {frameworks.find((f) => f.value === value)?.label}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setDialogOpen(false);
                                // Handle the selected value here
                                console.log("Selected:", value);
                            }}
                            disabled={!value}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {value && (
                <div className="mt-6 p-4 border rounded-lg bg-green-50 border-green-200">
                    <p className="text-green-800 truncate">
                        ✅ You selected: <span className="font-semibold">
                            {frameworks.find((f) => f.value === value)?.label}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
