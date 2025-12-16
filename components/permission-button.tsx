import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PermissionButtonProps extends ButtonProps {
  hasPermission: boolean;
  permissionMessage?: string;
  children: React.ReactNode;
}

/**
 * PermissionButton - A button that can be disabled based on permission checks
 *
 * Shows a tooltip with a custom message when the user doesn't have permission
 *
 * Usage:
 * <PermissionButton
 *   hasPermission={user.canManageClaims}
 *   permissionMessage="You don't have permission to delete claims"
 * >
 *   Delete
 * </PermissionButton>
 */
export const PermissionButton = React.forwardRef<
  HTMLButtonElement,
  PermissionButtonProps
>(
  (
    {
      hasPermission,
      permissionMessage = "You don't have permission for this action",
      children,
      ...props
    },
    ref
  ) => {
    if (hasPermission) {
      return (
        <Button ref={ref} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              disabled
              className={cn(props.className, "opacity-50 cursor-not-allowed")}
              {...props}
            >
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{permissionMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

PermissionButton.displayName = "PermissionButton";
