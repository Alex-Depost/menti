"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
    id: string;
    label: string;
    type?: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    helpText?: string;
    error?: string;
    children?: ReactNode;
}

export function FormField({
    id,
    label,
    type = "text",
    value = "",
    onChange,
    placeholder,
    helpText,
    error,
    children
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {children || (
                <Input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={error ? "border-red-500" : ""}
                />
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
        </div>
    );
}