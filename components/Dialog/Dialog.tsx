import { computed, useSignal } from "@preact/signals";
import { Show } from "@preact/signals/utils";
import { clsx } from "clsx/lite";
import {
  type ComponentChild,
  type ComponentChildren,
  isValidElement,
  type JSX,
  toChildArray,
} from "preact";
import { useCallback, useLayoutEffect, useMemo, useRef } from "preact/hooks";
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

export interface DialogProps
  extends JSX.DialogHTMLAttributes<HTMLDialogElement> {
  defaultOpen?: boolean;
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
    onOpenChange,
    ...restProps
  } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = useSignal(defaultOpen);
  const internalOpen = computed(() =>
    open?.valueOf() as boolean ?? isOpen.value ?? false
  );
  const slots = getChildSlots(children);

  const className = clsx(
    "dialog",
    "modal",
    "z-9999",
    "transition-none",
  );

  const onRequestOpenChangeHandler = useCallback((e: DialogOpenChangeEvent) => {
    if (internalOpen.value !== e.detail.open) {
      onOpenChange?.(e);
    }
    isOpen.value = e.detail.open;
  }, []);

  const requestOpenChange = useCallback((e: DialogOpenChangeEvent) => {
    onRequestOpenChangeHandler(e);
  }, [onRequestOpenChangeHandler]);

  const onDialogCloseHandler = useCallback(() => {
    onRequestOpenChangeHandler(createDialogChangeEvent(false));
  }, []);

  const contextValue = useMemo<DialogContextValue>(() => ({
    open: open?.valueOf() as boolean ?? isOpen.value ?? false,
    requestOpenChange,
  }), [isOpen, requestOpenChange]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (internalOpen.value) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [internalOpen.value]);

  return (
    <DialogContextProvider value={contextValue}>
      {slots.triggerElement}

      <Show when={internalOpen}>
        <dialog
          {...restProps}
          ref={dialogRef}
          class={className}
          onClose={onDialogCloseHandler}
        >
          {slots.children}
        </dialog>
      </Show>
    </DialogContextProvider>
  );
}
