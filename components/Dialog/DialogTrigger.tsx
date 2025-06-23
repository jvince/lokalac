import {
  cloneElement,
  type ComponentChild,
  Fragment,
  isValidElement,
} from "preact";
import { useDialogContext } from "./dialogContext.ts";
import { createDialogChangeEvent } from "./Dialog.tsx";

interface DialogTriggerProps {
  children: ComponentChild;
  triggerAction?: "open" | "close";
}

function getTriggerChild(children: ComponentChild) {
  if (!isValidElement(children) || children.type === Fragment) {
    throw new Error("DialogTrigger must have a single valid child element.");
  }

  return children;
}

function applyTriggerPropsToChild(
  child: ComponentChild,
  triggerChildProps: Record<string, unknown>,
) {
  if (!isValidElement(child) || child.type === Fragment) {
    throw new Error("DialogTrigger must have a single valid child element.");
  }

  return cloneElement(child, triggerChildProps);
}

export function DialogTrigger(props: DialogTriggerProps) {
  const { children, triggerAction = "open" } = props;

  const child = getTriggerChild(children);

  const { requestOpenChange } = useDialogContext();

  const onClickHandler = () => {
    requestOpenChange(createDialogChangeEvent(
      triggerAction === "open" ? true : false,
    ));
  };

  const triggerChildProps = {
    ...child.props,
    onClick: onClickHandler,
  };

  return applyTriggerPropsToChild(children, triggerChildProps);
}
