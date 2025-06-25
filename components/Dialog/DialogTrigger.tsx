import {
  cloneElement,
  Fragment,
  isValidElement,
  type JSX,
  type VNode,
} from "preact";
import { createDialogChangeEvent } from "./Dialog.tsx";
import { useDialogContext } from "./dialogContext.ts";

interface DialogTriggerProps {
  children: VNode<JSX.HTMLAttributes<HTMLElement>>;
  triggerAction?: "open" | "close";
}

function getTriggerChild(children: VNode<JSX.HTMLAttributes<HTMLElement>>) {
  if (!isValidElement(children) || children.type === Fragment) {
    throw new Error("DialogTrigger must have a single valid child element.");
  }

  return children;
}

function applyTriggerPropsToChild(
  child: VNode<JSX.HTMLAttributes<HTMLElement>>,
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

  const onClickHandler = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    requestOpenChange(createDialogChangeEvent(
      triggerAction === "open" ? true : false,
    ));

    if (child.props.onClick) {
      child.props.onClick(e);
    }
  };

  const triggerChildProps = {
    ...child.props,
    onClick: onClickHandler,
  };

  return applyTriggerPropsToChild(children, triggerChildProps);
}
