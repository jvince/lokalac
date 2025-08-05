import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { DialogOpenChangeEvent, type DialogSize } from "./Dialog.tsx";

export interface DialogContextValue {
  size?: DialogSize;
  open: boolean;
  requestOpenChange: (e: DialogOpenChangeEvent) => void;
}

const defaultDialogContextValue: DialogContextValue = {
  size: undefined,
  open: false,
  requestOpenChange: () => {},
};

const DialogContext = createContext<DialogContextValue>(null!);

export const DialogContextProvider = DialogContext.Provider;

export function useDialogContext() {
  const value = useContext(DialogContext);
  return (value ?? defaultDialogContextValue);
}
