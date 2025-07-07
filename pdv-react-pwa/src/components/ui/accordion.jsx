import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const AccordionContext = createContext();

export function Accordion({
  type = "single",
  collapsible = false,
  className,
  children,
  ...props
}) {
  const [value, setValue] = useState("");

  const handleValueChange = (newValue) => {
    if (type === "single") {
      if (collapsible && value === newValue) {
        setValue("");
      } else {
        setValue(newValue);
      }
    }
  };

  return (
    <AccordionContext.Provider
      value={{ value, setValue: handleValueChange, type }}
    >
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children, ...props }) {
  return (
    <div className={cn("border-b", className)} {...props}>
      {children}
    </div>
  );
}

export function AccordionTrigger({ className, children, ...props }) {
  const { value, setValue, type } = useContext(AccordionContext);
  const isOpen = value === props.value;

  return (
    <button
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={() => setValue(props.value)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
}

export function AccordionContent({ className, children, ...props }) {
  const { value, type } = useContext(AccordionContext);
  const isOpen = value === props.value;

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        isOpen ? "animate-accordion-down" : "animate-accordion-up"
      )}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
}
