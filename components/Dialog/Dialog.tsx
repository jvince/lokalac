import { clsx } from "clsx/lite";
import {
  type ComponentChild,
  type ComponentChildren,
  isValidElement,
  type JSX,
  toChildArray,
} from "preact";
import { createPortal } from "preact/compat";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { DialogContextProvider, DialogContextValue } from "./dialogContext.ts";
import { DialogTrigger } from "./DialogTrigger.tsx";

export type DialogOpenChangeData = {
  open: boolean;
};

export interface DialogOpenChangeEvent
  extends CustomEvent<DialogOpenChangeData> {}

export function createDialogChangeEvent(
  open: boolean,
): DialogOpenChangeEvent {
  return new CustomEvent<DialogOpenChangeData>("dialogopenchange", {
    detail: { open },
  });
}

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps
  extends JSX.DialogHTMLAttributes<HTMLDialogElement> {
  defaultOpen?: boolean;
  size?: DialogSize;
  onOpenChange?: (e: DialogOpenChangeEvent) => void;
}

interface DialogSlots {
  triggerElement?: ComponentChild;
  children?: ComponentChildren;
}

function getChildSlots(children: ComponentChildren) {
  const arr = toChildArray(children);
  const slots: DialogSlots = {};

  if (arr.length && isValidElement(arr[0]) && arr[0].type === DialogTrigger) {
    slots.triggerElement = arr.shift();
  }
  slots.children = arr;

  return slots;
}

export function Dialog(props: DialogProps) {
  const {
    children,
    defaultOpen,
    open,
    size,
    onOpenChange,
    ...restProps
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const controlledOpen = open?.valueOf() as boolean | undefined;
  const [isOpen, setIsOpen] = useState(controlledOpen ?? defaultOpen ?? false);
  const slots = getChildSlots(children);

  const className = clsx(
    "dialog",
    "modal",
    "z-9999",
    "transition-none",
  );

  const onRequestOpenChangeHandler = useCallback((e: DialogOpenChangeEvent) => {
    if (isOpen !== e.detail.open) {
      onOpenChange?.(e);
    }
    setIsOpen(e.detail.open);
  }, [isOpen, onOpenChange]);

  const requestOpenChange = useCallback((e: DialogOpenChangeEvent) => {
    onRequestOpenChangeHandler(e);
  }, [onRequestOpenChangeHandler]);

  const onDialogCloseHandler = useCallback(() => {
    onRequestOpenChangeHandler(createDialogChangeEvent(false));
  }, []);

  const contextValue = useMemo<DialogContextValue>(() => ({
    open: isOpen,
    size,
    requestOpenChange,
  }), [isOpen, size, requestOpenChange]);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const portalTarget = globalThis.document?.body;

  return (
    <DialogContextProvider value={contextValue}>
      {slots.triggerElement}

      {isOpen && portalTarget && createPortal(
        <dialog
          {...restProps}
          ref={dialogRef}
          class={className}
          onClose={onDialogCloseHandler}
        >
          {slots.children}
          <form method="dialog" className="modal-backdrop">
            <button type="submit">close</button>
          </form>
        </dialog>,
        portalTarget,
      )}
    </DialogContextProvider>
  );
}
