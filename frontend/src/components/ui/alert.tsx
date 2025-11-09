import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 bg-green-50 dark:border-green-500 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:border-yellow-500 [&>svg]:text-yellow-600",
        info:
          "border-blue-500/50 text-blue-700 bg-blue-50 dark:border-blue-500 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// Pre-configured alert components
export const ErrorAlert = ({ title, message, className }: { title?: string; message: string; className?: string }) => (
  <Alert variant="destructive" className={className}>
    <XCircle className="h-4 w-4" />
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export const SuccessAlert = ({ title, message, className }: { title?: string; message: string; className?: string }) => (
  <Alert variant="success" className={className}>
    <CheckCircle className="h-4 w-4" />
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export const WarningAlert = ({ title, message, className }: { title?: string; message: string; className?: string }) => (
  <Alert variant="warning" className={className}>
    <AlertTriangle className="h-4 w-4" />
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export const InfoAlert = ({ title, message, className }: { title?: string; message: string; className?: string }) => (
  <Alert variant="info" className={className}>
    <Info className="h-4 w-4" />
    {title && <AlertTitle>{title}</AlertTitle>}
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export { Alert, AlertTitle, AlertDescription };

