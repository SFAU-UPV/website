"use client";

import { useState } from "react";
import { Button } from "@heroui/react";

export function AdminPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="admin-password-field">
      <label htmlFor={id}>{label}</label>
      <div className="admin-password-input-wrap">
        <input
          id={id}
          required
          minLength={minLength}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="admin-password-toggle"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onPress={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
