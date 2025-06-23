import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { DialogOpenChangeEvent } from "./Dialog.tsx";

export interface DialogContextValue {
  open: boolean;
  requestOpenChange: (e: DialogOpenChangeEvent) => void;
}

const defaultDialogContextValue: DialogContextValue = {
  open: false,
  requestOpenChange: () => {},
};

const DialogContext = createContext<DialogContextValue>(null!);

export const DialogContextProvider = DialogContext.Provider;

export function useDialogContext() {
  const value = useContext(DialogContext);
  return (value ?? defaultDialogContextValue);
}
